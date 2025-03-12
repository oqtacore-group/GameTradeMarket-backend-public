import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { SecretManagerService } from '../secret-manager/secret-manager.service';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryEntity } from '../../inventory/models/inventory.entity';
import { Repository } from 'typeorm';

interface IOpenSeaBotOptions {
  host: string;
  api_key: string;
}

@Injectable()
export class OpenseaBotService implements OnApplicationBootstrap {
  private readonly logger = new Logger(OpenseaBotService.name);
  HOST: string;
  API_KEY: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly secretManagerService: SecretManagerService,
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepository: Repository<InventoryEntity>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const { host, api_key } = (await this.secretManagerService.getSecretValue(
      'OPENSEA_BOT',
    )) as IOpenSeaBotOptions;
    this.HOST = host;
    this.API_KEY = api_key;
  }

  async checkPriceToken(
    contract: string,
    token: string,
    blockchain: string,
  ): Promise<void> {
    try {
      await lastValueFrom(
        this.httpService.post(
          `${this.HOST}/check-price`,
          {
            contract,
            token,
            blockchain,
          },
          {
            headers: {
              'X-Api-Key': this.API_KEY,
            },
          },
        ),
      );
      this.logger.debug('added success');
    } catch (err) {
      this.logger.debug(err.message);
    }
  }
}
