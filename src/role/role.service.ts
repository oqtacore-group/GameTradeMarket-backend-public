import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, In, Repository } from 'typeorm';
import { RoleEntity } from './models/role.entity';
import { CreateRoleDto, DeleteRoleDto, UpdateRoleDto } from './dto';
import { UserRoleEntity } from './models/user-role.entity';
import { ProfileEntity } from './models/profile.entity';
import { RoleUpdateParams } from './interfaces/update-role.input';
import { RoleParams } from './interfaces/role.input';
import { AccessResource } from './resource/dto/resource.dto';
import { RoleEnum } from './role.decorator';
import { AccountEntity } from '../account/models/account.entity';

@Injectable()
export class RoleService {
  private logger = new Logger(RoleService.name);
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,
  ) {}

  getAll(params: RoleParams): Promise<RoleEntity[]> {
    return this.roleRepository.find({ where: { ...params } });
  }

  async create(payload: RoleEntity): Promise<CreateRoleDto> {
    const role = this.roleRepository.create(payload);
    await role.save();
    return {
      message: 'Role is created',
      code: 'ROLE_CREATED',
    };
  }

  async update(payload: RoleUpdateParams): Promise<UpdateRoleDto> {
    await this.roleRepository.update(
      { code: payload.code },
      { code: payload.newCode },
    );
    return {
      message: 'Role is updated',
      code: 'ROLE_UPDATED',
    };
  }

  async delete(code: string): Promise<DeleteRoleDto> {
    await this.roleRepository.delete(code);
    return {
      message: 'Role is deleted',
      code: 'ROLE_DELETED',
    };
  }

  async getAccessProfiles(user_id: string): Promise<AccessResource[]> {
    const res = await this.userRoleRepository.findOne({
      relations: ['role', 'role.profiles'],
      where: { user_id },
    });

    return (
      res?.role?.profiles?.map((p) => ({ path: p.path } as AccessResource)) ||
      []
    );
  }

  async addUserRoles(
    email: string,
    id: string,
    items: RoleEnum[],
  ): Promise<void> {
    if (!email && !id) return;
    const account = await this.accountRepository.findOne({
      select: ['id'],
      where: {
        ...(email ? { email } : {}),
        ...(id ? { id } : {}),
      },
    });
    if (!account) return;
    await getManager().transaction(async (t) => {
      await Promise.all(
        items.map((code) =>
          t.insert(UserRoleEntity, { user_id: account.id, code }),
        ),
      );
    });
  }

  async setUserRoles(
    email: string,
    id: string,
    items: RoleEnum[],
  ): Promise<void> {
    if (!email && !id) return;
    const account = await this.accountRepository.findOne({
      select: ['id'],
      where: {
        ...(email ? { email } : {}),
        ...(id ? { id } : {}),
      },
    });
    if (!account) return;
    await getManager().transaction(async (t) => {
      await t.delete(UserRoleEntity, { user_id: account.id });
      await Promise.all(
        items.map((code) =>
          t.insert(UserRoleEntity, { user_id: account.id, code }),
        ),
      );
    });
  }

  async deleteUserRoles(
    email: string,
    id: string,
    items: RoleEnum[],
  ): Promise<void> {
    if (!email && !id) return;
    const account = await this.accountRepository.findOne({
      select: ['id'],
      where: {
        ...(email ? { email } : {}),
        ...(id ? { id } : {}),
      },
    });
    if (!account) return;
    await getManager().transaction(async (t) => {
      await Promise.all(
        items.map((code) =>
          t.delete(UserRoleEntity, { user_id: account.id, code }),
        ),
      );
    });
  }

  async addRoleResources(code: string, items: string[]) {
    await getManager().transaction(async (t) => {
      await Promise.all(
        items.map((path) => t.insert(ProfileEntity, { code, path })),
      );
    });
  }

  async deleteRoleResources(code: string, items: string[]) {
    await getManager().transaction(async (t) => {
      await Promise.all(
        items.map((path) => t.insert(ProfileEntity, { code, path })),
      );
    });
  }

  async verifyRoles(user_id: string, roles: RoleEnum[] = []): Promise<boolean> {
    // TODO for the future, should cache to reduce database load
    return !!(await this.userRoleRepository.findOne({
      where: { user_id, code: In(roles) },
    }));
  }
}
