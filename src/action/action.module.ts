import { Module } from '@nestjs/common';
import { ActionResolver } from './action.resolver';
import { ActionService } from './action.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ActionTransactionEntity,
  ActionTypeEntity,
  UserActionEntity,
} from './models';
import { AccountEntity } from '../account/models/account.entity';
import { RoleModule } from '../role/role.module';
import { AuthModule } from '../auth/auth.module';
import { UserVisitEntity } from '../account/models/user-visit.entity';

@Module({
  imports: [
    AuthModule,
    RoleModule,
    TypeOrmModule.forFeature([
      AccountEntity,
      ActionTypeEntity,
      UserActionEntity,
      ActionTransactionEntity,
      UserVisitEntity,
    ]),
  ],
  providers: [ActionService, ActionResolver],
  exports: [ActionService],
})
export class ActionModule {}
