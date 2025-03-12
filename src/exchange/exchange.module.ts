import { CacheModule, Module } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourceCurrencyEntity } from '../source/models/source-currency.entity';
import { CoinInfoEntity } from '../source/models/coin-info.entity';
import { ContractEntity } from '../inventory/models/contract.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    CacheModule.register({
      ttl: 43200,
    }),
    TypeOrmModule.forFeature([SourceCurrencyEntity, CoinInfoEntity, ContractEntity]),
  ],
  providers: [ExchangeService],
  exports: [ExchangeService],
})
export class ExchangeModule {
}
