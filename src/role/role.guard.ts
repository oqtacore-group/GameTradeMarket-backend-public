import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY, RoleEnum } from './role.decorator';
import { RoleService } from './role.service';
import { IUser } from '../auth/interfaces/user.interface';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly roleService: RoleService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const info = GqlExecutionContext.create(context).getInfo();
    const ctx = GqlExecutionContext.create(context).getContext();
    const user = ctx.user as IUser;

    if (user.act && info.operation.operation === 'mutation') {
      throw new ForbiddenException({
        message: 'You are not allowed to change',
        code: 'ACCESS_DENIED',
      });
    }

    const roles = this.reflector.get<RoleEnum[]>(
      ROLE_KEY,
      context.getHandler(),
    );
    if (!roles) {
      return true;
    }
    const is_verify = await this.roleService.verifyRoles(user.sub, roles);
    if (!is_verify) {
      throw new ForbiddenException({
        message: 'Role invalid',
        code: 'ACCESS_DENIED',
      });
    }
    return is_verify;
  }
}
