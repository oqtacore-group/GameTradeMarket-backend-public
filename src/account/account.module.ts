import { Module } from '@nestjs/common';
import { AccountResolver } from './account.resolver';
import { AccountService } from './account.service';
import { WalletModule } from './wallet/wallet.module';
import { FriendModule } from './friend/friend.module';
import { SubscribeModule } from './subscribe/subscribe.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from './models/account.entity';
import { AuthModule } from '../auth/auth.module';
import { AccountSessionEntity } from './models/account-session.entity';
import { RoleModule } from '../role/role.module';
import { InventoryModule } from '../inventory/inventory.module';
import { MailModule } from '../mail/mail.module';
import { SecretManagerModule } from '../utils/secret-manager/secret-manager.module';
import { AuthResolver, ReviewOwnerDtoResolver } from './auth.resolver';
import { SourceModule } from '../source/source.module';
import { ReviewEntity } from '../review/models/review.entity';
import { UserVisitEntity } from './models/user-visit.entity';

@Module({
  imports: [
    AuthModule,
    RoleModule,
    WalletModule,
    FriendModule,
    SubscribeModule,
    InventoryModule,
    MailModule,
    SecretManagerModule,
    SourceModule,
    TypeOrmModule.forFeature([
      AccountEntity,
      AccountSessionEntity,
      ReviewEntity,
      UserVisitEntity,
    ]),
  ],
  providers: [
    AccountResolver,
    AuthResolver,
    ReviewOwnerDtoResolver,
    AccountService,
  ],
  exports: [AccountService],
})
export class AccountModule {}
