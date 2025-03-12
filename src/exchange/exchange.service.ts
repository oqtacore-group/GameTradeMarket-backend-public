import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { SourceCurrencyEntity } from '../source/models/source-currency.entity';
import { Repository } from 'typeorm';
import { CoinInfoEntity } from '../source/models/coin-info.entity';
import { ContractEntity } from '../inventory/models/contract.entity';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import moment from 'moment';
import { getFileExtFromUrl } from 'src/helpers';

interface CoinPriceResponse {
  contract_address: string;
  market_data: {
    current_price: {
      usd: number;
    };
  };
}

@Injectable()
export class ExchangeService {
  private logger = new Logger(ExchangeService.name);
  ttl = 43200;

  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private httpService: HttpService,
    private configService: ConfigService,
    @InjectRepository(ContractEntity)
    private readonly contractRepository: Repository<ContractEntity>,
    @InjectRepository(SourceCurrencyEntity)
    private readonly sourceCurrencyRepository: Repository<SourceCurrencyEntity>,
    @InjectRepository(CoinInfoEntity)
    private readonly coinInfoRepository: Repository<CoinInfoEntity>,
  ) {}

  async getCoinPriceAndContractById(id: string): Promise<[number, string]> {
    if (!id) return [0, null];
    const response = await lastValueFrom(
      this.httpService.get<CoinPriceResponse>(
        `https://api.coingecko.com/api/v3/coins/${id}`,
      ),
    );

    const price = response.data.market_data?.current_price?.usd ?? 0;
    const contractAddress = response.data.contract_address;

    return [price, contractAddress];
  }

  saveCoinInfoImage(key, body) {
    try {
      const client = new S3Client({
        credentials: {
          accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
          secretAccessKey: this.configService.get<string>(
            'AWS_SECRET_ACCESS_KEY',
          ),
        },
        region: this.configService.get<string>('AWS_REGION'),
      });
      const command = new PutObjectCommand({
        Bucket: this.configService.get<string>('AWS_STORAGE_BUCKET'),
        Key: key,
        Body: body.data,
      });

      return client.send(command);
    } catch (e) {
      this.logger.debug(e.message);
    }
  }

  sleep = (ms) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  coinMutex = {};
  coinLastUpdated = {};
  async saveCoinInfoByContractId(
    coin_contract: string,
    coin_blockchain: string,
  ): Promise<any> {
    const key = `${coin_blockchain}/${coin_contract}`;
    let path = `coin/${key}`;

    while (this.coinMutex[key]) {
      await this.sleep(200);
    }

    const hourAgo = moment().add(-1, 'hours');
    if (this.coinLastUpdated[key] > hourAgo) {
      const _coin = await this.getCoinInfoByContractId(
        coin_contract,
        coin_blockchain,
      );
      if (_coin?.thumbnail_url) return _coin;
    }
    this.coinMutex[key] = true;
    try {
      let response, coin, exchange;
      let coinInfo;
      if (
        !coin_contract ||
        coin_contract == '0x0000000000000000000000000000000000000000'
      ) {
        switch (coin_blockchain) {
          case 'ethereum_mainnet':
            coin = 'ethereum';
            break;
          case 'solana':
            coin = 'solana';
            break;
          case 'polygon':
            coin = 'matic-network';
            break;
          case 'binance':
            coin = 'binancecoin';
            break;
        }

        try {
          response = await lastValueFrom(
            this.httpService.get(
              `https://api.coingecko.com/api/v3/coins/${coin}`,
            ),
          );
        } catch (e) {
          return null;
        }

        if (!response.data) {
          return null;
        }

        path += '.' + getFileExtFromUrl(response.data.image.large);

        try {
          exchange = await lastValueFrom(
            this.httpService.get(
              'https://api.coingecko.com/api/v3/simple/price',
              {
                params: {
                  ids: coin,
                  vs_currencies: 'usd',
                  include_market_cap: true,
                },
              },
            ),
          );
        } catch (e) {
          return null;
        }

        if (!exchange?.data) {
          return null;
        }

        coinInfo = this.coinInfoRepository.create({
          name: response?.data.name,
          contract: '0x0000000000000000000000000000000000000000',
          blockchain: coin_blockchain,
          price: exchange?.data[coin]?.usd,
          decimals: 18,
          symbol: response?.data?.symbol,
          thumbnail_url: `https://${process.env.AWS_STORAGE_BUCKET}/${path}`, // TODO path
          external_id: response?.data.id,
          external_platform: 'COINGECKO',
          update_time: 'now()',
        });
      } else {
        let blockchain;
        switch (coin_blockchain) {
          case 'ethereum_mainnet':
            blockchain = 'ethereum';
            break;
          case 'solana':
            blockchain = 'solana';
            break;
          case 'polygon':
            blockchain = 'polygon-pos';
            break;
          case 'binance':
            blockchain = 'binance-smart-chain';
            break;
        }

        if (!blockchain) {
          return null;
        }

        try {
          response = await lastValueFrom(
            this.httpService.get(
              `https://api.coingecko.com/api/v3/coins/${blockchain}/contract/${coin_contract}`,
            ),
          );

          if (!response?.data || response?.error) {
            return null;
          }

          path += '.' + getFileExtFromUrl(response?.data?.image?.large);

          try {
            exchange = await lastValueFrom(
              this.httpService.get(
                'https://api.coingecko.com/api/v3/simple/price',
                {
                  params: {
                    ids: response?.data?.id,
                    vs_currencies: 'usd',
                    include_market_cap: true,
                  },
                },
              ),
            );
          } catch (e) {
            return null;
          }

          if (!exchange?.data) {
            return null;
          }

          coinInfo = this.coinInfoRepository.create({
            name: response?.data?.name,
            contract: coin_contract,
            blockchain: coin_blockchain,
            price: exchange?.data[response?.data?.id]?.usd,
            decimals:
              response?.data?.detail_platforms[
                response?.data?.asset_platform_id
              ]?.decimal_place ?? 18,
            symbol: response?.data.symbol,
            thumbnail_url: `https://${process.env.AWS_STORAGE_BUCKET}/${path}`,
            external_id: response?.data?.id,
            external_platform: 'COINGECKO',
            update_time: 'now()',
          });
        } catch (e) {
          return coinInfo;
        }
      }

      try {
        const image = await lastValueFrom(
          this.httpService.get(response?.data?.image?.large, {
            responseType: 'arraybuffer',
          }),
        );
        await this.saveCoinInfoImage(path, image);
        await this.coinInfoRepository.upsert(coinInfo, [
          'contract',
          'blockchain',
        ]);

        this.coinLastUpdated[key] = moment();

        return coinInfo;
      } catch (err) {
        console.error(err);
      }
    } finally {
      this.coinMutex[key] = false;
    }
  }

  async getCoinInfoByContractId(
    coin_contract: string,
    coin_blockchain: string,
  ): Promise<CoinInfoEntity> {
    const oneHourAgo = moment().subtract(10, 'hour');
    let item;
    try {
      item = await this.coinInfoRepository.findOne({
        where: {
          contract: coin_contract,
          blockchain: coin_blockchain,
        },
      });
    } catch (e) {}

    const updateTime = moment(item?.update_time);
    if (!item || updateTime.isBefore(oneHourAgo)) {
      return null;
    }

    return item;
  }

  @Interval(600000)
  async syncPrice(): Promise<void> {
    const currencies = await this.sourceCurrencyRepository.find({
      relations: ['coin'],
    });
    try {
      const exchanges = [];
      currencies.map(async (currency) => {
        if (currency.coin) {
          const [price, contractAddress] =
            await this.getCoinPriceAndContractById(currency.coin.external_id);
          if (contractAddress) {
            await this.coinInfoRepository.update(
              {
                external_id: currency.coin.external_id,
              },
              {
                price,
                contract: contractAddress,
              },
            );
            exchanges.push({
              id: currency.id,
              price,
              contract_address: contractAddress,
            });
          }
        }
      });
      await this.cacheManager.set('exchanges', exchanges, this.ttl);
    } catch (err) {
      this.logger.error(err.message);
    }
  }
}
