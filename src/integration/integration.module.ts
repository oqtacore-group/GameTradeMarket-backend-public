import { CacheModule, Module } from '@nestjs/common';
import { IntegrationResolver, MintingResolver } from './integration.resolver';
import { AuthModule } from '../auth/auth.module';
import { IntegrationService } from './integration.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryEntity } from '../inventory/models/inventory.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { EventModule } from '../event/event.module';
import { WalletEntity } from '../account/wallet/models/wallet.entity';
import { HttpModule } from '@nestjs/axios';
import { ActionModule } from '../action/action.module';
import { BlogEntity } from '../blog/models/blog.entity';
import {
  CreateUserController,
  IntegrationContractController,
  IntegrationController,
} from './integration.controller';
import { ItemUpdateLogEntity } from 'src/inventory/models/item-update-log.entity';
import { AccessEntity } from 'src/account/models/access.entity';
import { AccessKeysGamesEntity } from '../account/models/access-keys-games.entity';
import { SourceUserActiveEntity } from '../source/models/source-user-active.entity';
import { ConfigModule } from '@nestjs/config';
import { FriendEntity } from '../account/friend/models/friend.entity';
import { UserAchievementEntity } from '../account/models/user-achievement.entity';
import { AchievementEntity } from '../achievement/models/achievement.entity';
import { ContractEntity } from 'src/inventory/models/contract.entity';
import { AccountEntity } from 'src/account/models/account.entity';
import { SourceEntity } from '../source/models/source.entity';
import { LaunchpadEntity } from 'src/inventory/models/minting.entity';

@Module({
  imports: [
    AuthModule,
    ActionModule,
    ConfigModule,
    InventoryModule,
    HttpModule,
    EventModule,
    CacheModule.register({
      ttl: 43200,
    }),
    TypeOrmModule.forFeature([
      InventoryEntity,
      SourceEntity,
      AchievementEntity,
      WalletEntity,
      UserAchievementEntity,
      FriendEntity,
      BlogEntity,
      ItemUpdateLogEntity,
      AccessEntity,
      AccessKeysGamesEntity,
      SourceUserActiveEntity,
      AchievementEntity,
    ]),
    TypeOrmModule.forFeature([
      InventoryEntity,
      WalletEntity,
      BlogEntity,
      ItemUpdateLogEntity,
      ContractEntity,
      AccountEntity,
      LaunchpadEntity,
    ]),
  ],
  providers: [IntegrationService, IntegrationResolver, MintingResolver],
  exports: [],
  controllers: [
    IntegrationController,
    IntegrationContractController,
    CreateUserController,
  ],
})
export class IntegrationModule {}
