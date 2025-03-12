import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RoleService } from './role.service';
import { RoleCreateParams } from './interfaces/create-role.input';
import { RoleUpdateParams } from './interfaces/update-role.input';
import { RoleEntity } from './models/role.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser } from '../auth/auth.guard';
import { IUser } from '../auth/interfaces/user.interface';
import { RoleParams } from './interfaces/role.input';
import { Role } from './dto/role.dto';
import { UserRoleParams } from './interfaces/user-role.input';
import { RoleResourcesParams } from './resource/interfaces/resource.interface';
import { UserRole } from './dto/user-role.dto';
import { Success } from '../utils/interfaces/response.interface';
import { CurrentUserRoles, RoleEnum } from './role.decorator';
import { RoleGuard } from './role.guard';

@UseGuards(AuthGuard, RoleGuard)
@Resolver('Role')
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}

  @Query(() => [Role], {
    nullable: true,
    description: 'List of available roles',
  })
  @CurrentUserRoles(RoleEnum.ADMIN)
  roles(@Args('params', { nullable: true }) params: RoleParams) {
    return this.roleService.getAll(params);
  }

  @Mutation(() => Success, {
    description: 'Add role',
  })
  @CurrentUserRoles(RoleEnum.ADMIN)
  roleCreate(@Args('params') params: RoleCreateParams) {
    return this.roleService.create(params as RoleEntity);
  }

  @Mutation(() => Success, {
    name: 'role',
    description: 'Update role',
  })
  @CurrentUserRoles(RoleEnum.ADMIN)
  roleUpdate(@Args('params') params: RoleUpdateParams) {
    return this.roleService.update(params);
  }

  @Mutation(() => Success, {
    description: 'Delete role',
  })
  @CurrentUserRoles(RoleEnum.ADMIN)
  roleDelete(@Args('code', { type: () => String }) code: string) {
    return this.roleService.delete(code);
  }

  @Query(() => UserRole)
  myAccessProfiles(@CurrentUser() owner: IUser) {
    return this.roleService.getAccessProfiles(owner.sub);
  }

  @Mutation(() => Success, {
    description: 'Assign roles to user',
  })
  @CurrentUserRoles(RoleEnum.ADMIN)
  async userAddRole(@Args('params') { email, user_id, roles }: UserRoleParams) {
    await this.roleService.addUserRoles(email, user_id, roles);
    return { message: 'Add role success', code: 'USER_ADD_ROLES_SUCCESS' };
  }

  @Mutation(() => Success, {
    description: 'Remove all user roles and assign new ones',
  })
  @CurrentUserRoles(RoleEnum.ADMIN)
  async userSetRole(@Args('params') { email, user_id, roles }: UserRoleParams) {
    await this.roleService.setUserRoles(email, user_id, roles);
    return { message: 'Set role success', code: 'USER_SET_ROLES_SUCCESS' };
  }

  @Mutation(() => Success, {
    description: 'Remove roles from user',
  })
  @CurrentUserRoles(RoleEnum.ADMIN)
  async userRemoveRole(
    @Args('params') { email, user_id, roles }: UserRoleParams,
  ) {
    await this.roleService.deleteUserRoles(email, user_id, roles);
    return {
      message: 'Remove role success',
      code: 'USER_REMOVE_ROLES_SUCCESS',
    };
  }

  @Mutation(() => Success)
  @CurrentUserRoles(RoleEnum.ADMIN)
  async roleAddResources(
    @Args('params', { nullable: true })
    { roleCode, resources }: RoleResourcesParams,
  ) {
    await this.roleService.addRoleResources(roleCode, resources);
    return {
      message: 'Add resource success',
      code: 'ADD_RESOURCE_SUCCESS',
    };
  }

  @Mutation(() => Success)
  @CurrentUserRoles(RoleEnum.ADMIN)
  async roleRemoveResources(
    @Args('params', { nullable: true })
    { roleCode, resources }: RoleResourcesParams,
  ) {
    await this.roleService.deleteRoleResources(roleCode, resources);
    return {
      message: 'Remove resource success',
      code: 'REMOVE_RESOURCE_SUCCESS',
    };
  }
}
