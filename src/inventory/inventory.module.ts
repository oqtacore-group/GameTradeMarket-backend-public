import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { InventoryService } from './inventory.service';
import { InventoryResolver } from './inventory.resolver';
import { ContractService } from './contract.service';
import { ListingService } from './listings/listing.service';
import { InventoryEntity } from './models/inventory.entity';
import { ContractEntity } from './models/contract.entity';
import { ListingEntity } from './listings/models/listing.entity';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../account/wallet/wallet.module';
import { NetworkEntity } from '../blockchain/models/network.entity';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { InventoryLikeEntity } from './models/inventory-like.entity';
import { RoleModule } from '../role/role.module';
import { OpenseaBotModule } from '../utils/opensea-bot/opensea-bot.module';
import { CommentModule } from './comments/comment.module';
import { SourceCurrencyEntity } from '../source/models/source-currency.entity';
import { ConfigModule } from '@nestjs/config';
import { ExchangeModule } from '../exchange/exchange.module';
import { SourceEntity } from '../source/models/source.entity';
import { SlideEntity } from './models/slide.entity';
import { ImmutableModule } from '../immutable/immutable.module';
import { InventoryController } from './inventory.controller';
import { CoinInfoEntity } from 'src/source/models/coin-info.entity';

@Module({
  imports: [
    AuthModule,
    RoleModule,
    BlockchainModule,
    HttpModule,
    WalletModule,
    OpenseaBotModule,
    CommentModule,
    ExchangeModule,
    ConfigModule,
    ImmutableModule,
    CacheModule.register({
      ttl: 43200,
    }),
    TypeOrmModule.forFeature([
      InventoryEntity,
      InventoryLikeEntity,
      ContractEntity,
      NetworkEntity,
      ListingEntity,
      SourceCurrencyEntity,
      SlideEntity,
      SourceEntity,
      CoinInfoEntity,
    ]),
  ],
  providers: [
    InventoryService,
    ContractService,
    ListingService,
    InventoryResolver,
  ],
  controllers: [InventoryController],
  exports: [InventoryService, ContractService],
})
export class InventoryModule {}
