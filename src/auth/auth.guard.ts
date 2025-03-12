import {
  Injectable,
  CanActivate,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { IUser } from './interfaces/user.interface';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): IUser | null =>
    GqlExecutionContext.create(ctx).getContext().user,
);

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.user.id;
  },
);
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    ctx.user = await this.authService.verifyAccessToken(
      ctx.headers.authorization,
    );
    return !!ctx.user;
  }
}

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).switchToWs().getClient();
    ctx.user = await this.authService.verifyAccessToken(
      ctx.handshake?.auth?.authorization || ctx.handshake?.auth?.Authorization,
    );
    return !!ctx.user;
  }
}

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    ctx.user = await this.authService.verifyAccessToken(
      ctx.headers.authorization,
    );
    return true;
  }
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    return this.authService.verifyApiKey(ctx.headers['x-api-key']);
  }
}

@Injectable()
export class ApiKeyGuardHttp implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    if (!apiKey) {
      return false;
    }
    const userId = await this.authService.verifyApiKeyUser(apiKey);
    request.user = { id: userId };
    return !!request.user;
  }
}

@Injectable()
export class PlayerTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const playerToken = request.headers['x-player-token'];
    if (!playerToken) {
      return false;
    }
    return this.authService.verifyPlayerToken(playerToken);
  }
}

@Injectable()
export class OverlayJwtGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];
    if (!authorization) {
      return false;
    }
    const user = await this.authService.verifyOverlayToken(authorization);
    if (user) {
      request.user = { id: user.id };
    }
    return !!request.user;
  }
}
