import {
  HttpStatus,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { InventoryService } from './inventory/inventory.service';
import { OpenseaBotService } from './utils/opensea-bot/opensea-bot.service';
import { NotificationService } from './notification/notification.service';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { SourceService } from './source/source.service';
import convert from 'xml-js';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryEntity } from './inventory/models/inventory.entity';
import { Repository } from 'typeorm';
import { AdminService } from './admin/admin.service';

const GEN_TITLE_SCHEMA = `# ------------------------------------------------------
# THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
# ------------------------------------------------------`;

@Injectable()
export class AppService implements OnApplicationBootstrap {
  private logger = new Logger(AppService.name);
  private schema: Buffer;
  readonly store: S3;

  constructor(
    private httpService: HttpService,
    private adminService: AdminService,
    private schedulerRegistry: SchedulerRegistry,
    private configService: ConfigService,
    private inventoryService: InventoryService,
    private sourceService: SourceService,
    private notificationService: NotificationService,
    private openseaBotService: OpenseaBotService,
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepository: Repository<InventoryEntity>,
  ) {
    this.store = new S3();
  }

  async getSitemapInfo() {
    const limitChunk = 30000;
    const tokensCount = await this.inventoryService.getTokensCount();
    const gamesCount = await this.sourceService.getGamesCount();
    return {
      tokensChunkCount: Math.ceil(tokensCount / limitChunk),
      gamesChunkCount: Math.ceil(gamesCount / limitChunk),
      limitChunk,
    };
  }

  async onApplicationBootstrap(): Promise<void> {
    fs.readFile(path.resolve(__dirname, '../schema.gql'), (err, data) => {
      if (err) throw err;
      this.schema = data;
    });
  }

  getSchema(): string {
    return this.schema.toString('utf-8').replace(GEN_TITLE_SCHEMA, '');
  }

  @Cron(CronExpression.EVERY_10_SECONDS, { name: 'SYNC_PRICE' })
  async updatePricesFromOpenSea() {
    const job = this.schedulerRegistry.getCronJob('SYNC_PRICE');
    job.stop();
    return;
    const collections = await this.inventoryService.getAllCollectionsByPlatform(
      'OPENSEA',
    );
    await Promise.all(
      collections.map(({ contract, token_value, contractData }) => {
        return this.openseaBotService.checkPriceToken(
          contract,
          token_value,
          contractData.blockchain,
        );
      }),
    );
    job.start();
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  clearNotifications() {
    this.logger.log('clear notifications');
    return this.notificationService.notificationsClearAllOutdated();
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM, { name: 'SITEMAP_SYNC' })
  async uploadSiteMap() {
    const job = this.schedulerRegistry.getCronJob('SITEMAP_SYNC');
    job.stop();
    try {
      const sitemap = await lastValueFrom(
        this.httpService.get('https://gametrade.market/sitemap.xml'),
      );
      if (sitemap.status === HttpStatus.OK) {
        await this.store
          .upload({
            Bucket: this.configService.get('AWS_STORAGE_BUCKET_NAME'),
            Body: sitemap.data,
            Key: `sitemap-marketplace.xml`,
          })
          .promise();
      }
    } catch (err) {
      this.logger.error(err.message);
    }
    try {
      const { tokensChunkCount, gamesChunkCount } = await this.getSitemapInfo();
      for (let chunk = 0; chunk < tokensChunkCount; chunk++) {
        this.logger.debug(`tokens chunk ${chunk}`);
        const values = await this.inventoryService.getTokensSiteMap(chunk);
        const value = {
          _declaration: {
            _attributes: {
              version: '1.0',
              encoding: 'utf-8',
            },
          },
          urlset: {
            _attributes: {
              xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
            },
            url: values,
          },
        };
        const result = convert.json2xml(JSON.stringify(value), {
          compact: true,
          ignoreComment: true,
          spaces: 4,
        });
        await this.store
          .upload({
            Bucket: this.configService.get('AWS_STORAGE_BUCKET_NAME'),
            Body: result,
            Key: `tokens/sitemap-marketplace-chunk-${chunk}.xml`,
          })
          .promise();
      }
      for (let chunk = 0; chunk < gamesChunkCount; chunk++) {
        const values = await this.sourceService.getGamesSiteMap(chunk);
        this.logger.debug(`games chunk ${chunk}`);
        const value = {
          _declaration: {
            _attributes: {
              version: '1.0',
              encoding: 'utf-8',
            },
          },
          urlset: {
            _attributes: {
              xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
            },
            url: values,
          },
        };
        const result = convert.json2xml(JSON.stringify(value), {
          compact: true,
          ignoreComment: true,
          spaces: 4,
        });
        await this.store
          .upload({
            Bucket: this.configService.get('AWS_STORAGE_BUCKET_NAME'),
            Body: result,
            Key: `games/sitemap-marketplace-chunk-${chunk}.xml`,
          })
          .promise();
      }
    } catch (err) {
      this.logger.error(err.message);
    } finally {
      job.start();
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS, { name: 'PLATFORM_SYNC' })
  async syncPlatform() {
    // const job = this.schedulerRegistry.getCronJob('PLATFORM_SYNC');
    // job.stop();
    return;
    const tokensCount = await this.inventoryService.getTokensCount();
    for (let chunk = 0; chunk < tokensCount; chunk++) {
      const tokens = await this.inventoryService.getTokensByChunk(chunk);
      await Promise.all(
        tokens.map(async (token) => {
          const asset = await this.inventoryService.getTokenMetaData(
            token.contract,
            `${token.token_value}`,
            token.contractData.network.code,
          );
          if (!asset) {
            return token;
          }
          await this.inventoryRepository.update(
            {
              id: token.id,
            },
            {
              platform:
                token.contractData.network.trade_contract ===
                asset.trade_contract
                  ? 'GAMETRADE'
                  : 'SEAPORT', // 'OPENSEA'
            },
          );
        }),
      );
      // job.start();
    }
  }

  // @Cron(CronExpression.EVERY_10_SECONDS, { name: 'BUY_TOKEN' })
  // async randomTokenBuy() {
  //   const job = this.schedulerRegistry.getCronJob('BUY_TOKEN');
  //   job.stop();
  //   try {
  //     await this.adminService.buyRandomToken();
  //   } finally {
  //     job.start();
  //   }
  // }
}
