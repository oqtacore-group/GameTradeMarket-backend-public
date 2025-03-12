import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { SecretManagerModule } from '../utils/secret-manager/secret-manager.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from '../account/models/account.entity';
import { AccountSessionEntity } from '../account/models/account-session.entity';
import { AccessEntity } from '../account/models/access.entity';
import { ReviewEntity } from '../review/models/review.entity';
import { UserVisitEntity } from '../account/models/user-visit.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    SecretManagerModule,
    ConfigModule,
    TypeOrmModule.forFeature([
      AccountSessionEntity,
      AccountEntity,
      AccessEntity,
      ReviewEntity,
      UserVisitEntity,
    ]),
  ],
  providers: [AuthService, AuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
