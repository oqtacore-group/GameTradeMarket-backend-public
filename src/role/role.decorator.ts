import { SetMetadata } from '@nestjs/common';

export const ROLE_KEY = 'roles';
export enum RoleEnum {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

export const CurrentUserRoles = (...roles: RoleEnum[]) => {
  return SetMetadata(ROLE_KEY, roles);
};
