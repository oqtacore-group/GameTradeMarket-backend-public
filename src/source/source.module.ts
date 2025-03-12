import { Module, forwardRef, CacheModule } from '@nestjs/common';
import { SourceService } from './source.service';
import {
  GameCardResolver,
  SourceNotAuthResolver,
  SourceResolver,
} from './source.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractEntity } from '../inventory/models/contract.entity';
import { SourceEntity } from './models/source.entity';
import { AuthModule } from '../auth/auth.module';
import { RoleModule } from '../role/role.module';
import { ConfigModule } from '@nestjs/config';
import { SourceUserEntity } from './models/source-user.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { AccountModule } from '../account/account.module';
import { ReviewModule } from '../review/review.module';
import { BlogModule } from '../blog/blog.module';
import { SourceGenreEntity } from './models/source-genre.entity';
import { GenreEntity } from '../genre/models/genre.entity';
import { SourceCurrencyEntity } from './models/source-currency.entity';
import { NetworkEntity } from '../blockchain/models/network.entity';
import { ExchangeModule } from '../exchange/exchange.module';
import { SecretManagerModule } from '../utils/secret-manager/secret-manager.module';
import { SourceController } from './source.controller';

@Module({
  imports: [
    AuthModule,
    RoleModule,
    ConfigModule,
    InventoryModule,
    ReviewModule,
    BlogModule,
    ExchangeModule,
    SecretManagerModule,
    forwardRef(() => AccountModule),
    CacheModule.register({
      ttl: 43200,
    }),
    TypeOrmModule.forFeature([
      ContractEntity,
      SourceEntity,
      GenreEntity,
      SourceUserEntity,
      SourceGenreEntity,
      SourceCurrencyEntity,
      NetworkEntity,
    ]),
  ],
  providers: [
    SourceService,
    SourceResolver,
    GameCardResolver,
    SourceNotAuthResolver,
  ],
  controllers: [SourceController],
  exports: [SourceService],
})
export class SourceModule {}
