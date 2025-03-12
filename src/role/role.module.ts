import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleResolver } from './role.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRoleEntity } from './models/user-role.entity';
import { RoleEntity } from './models/role.entity';
import { ResourceModule } from './resource/resource.module';
import { ProfileEntity } from './models/profile.entity';
import { AuthModule } from '../auth/auth.module';
import { RoleGuard } from './role.guard';
import { AccountEntity } from '../account/models/account.entity';

@Module({
  imports: [
    AuthModule,
    ResourceModule,
    TypeOrmModule.forFeature([
      AccountEntity,
      ProfileEntity,
      RoleEntity,
      UserRoleEntity,
    ]),
  ],
  providers: [RoleService, RoleGuard, RoleResolver],
  exports: [RoleService],
})
export class RoleModule {}
