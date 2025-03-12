import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
  Int,
} from '@nestjs/graphql';
import { AccountService } from './account.service';
import { AccountEntity } from './models/account.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser, UserGuard } from '../auth/auth.guard';
import { IUser } from '../auth/interfaces/user.interface';
import { IAccountUser } from './account.interface';
import { UserFilters, UserParams } from './interfaces/user.input';
import { UserConnection, CountUsers } from './dto/user.dto';
import { LoopbackResult } from '../utils/interfaces/utils.interface';
import { RoleService } from '../role/role.service';
import { BalanceService } from './wallet/balance.service';
import { InventoryService } from '../inventory/inventory.service';
import { Success } from '../utils/interfaces/response.interface';
import { FriendService } from './friend/friend.service';
import { FriendParams } from './friend/interfaces/friend.input';
import { Token } from '../auth/dto/token.dto';
import { CurrentUserRoles, RoleEnum } from '../role/role.decorator';
import { LoginByUserParams } from '../auth/interfaces/sign-in.input';
import { RoleGuard } from '../role/role.guard';
import { GameConnection } from '../source/dto/source.dto';
import { GamesParams } from '../source/interfaces/source.input';
import { SourceService } from '../source/source.service';
import { CardConnection } from '../inventory/interfaces/card.interface';
import { GetInventoryParams } from '../inventory/interfaces/inventory.input';

@UseGuards(AuthGuard, RoleGuard)
@Resolver(() => AccountEntity)
export class AccountResolver {
  constructor(
    private readonly accountService: AccountService,
    private readonly friendService: FriendService,
    private readonly balanceService: BalanceService,
    private readonly inventoryService: InventoryService,
    private readonly sourceService: SourceService,
    private readonly roleService: RoleService,
  ) {}

  @Query(() => AccountEntity, { nullable: true })
  async user(
    @Args('id', { type: () => ID }) id: string,
    @Args('custom_url', { type: () => String }) custom_url: string,
  ) {
    if (custom_url) {
      return this.accountService.getUserByCustomUrl(custom_url);
    } else {
      return this.accountService.getUserById(id);
    }
  }

  @Query(() => UserConnection, { nullable: true })
  async users(
    @Args('params', { nullable: true }) params: UserFilters,
    @CurrentUser() owner: IUser,
  ) {
    return this.accountService.getUsers(params, owner);
  }

  @Query(() => CountUsers)
  async usersCount() {
    const total = this.accountService.getUsersCount();
    return { total };
  }

  @Query(() => AccountEntity)
  async me(@CurrentUser() { sub }: IUser) {
    const [account, accessProfiles] = await Promise.all([
      this.accountService.getUserById(sub),
      this.roleService.getAccessProfiles(sub),
    ]);
    account.wallets = await Promise.all(
      account.wallets.map(async (wallet) => ({
        ...wallet,
        balances: await this.balanceService.getBalances([wallet.address]),
      })),
    );
    return { ...account, accessProfiles };
  }

  @Query(() => AccountEntity)
  async ping(@CurrentUser() owner: IUser) {
    await this.accountService.updateUser(owner.sub, {
      online_time: new Date(),
    });
    return {
      message: 'Pong',
      code: 'Success',
    };
  }

  @Mutation(() => Success)
  async deleteUser(@CurrentUser() owner: IUser, @Args('id') id: string) {
    await this.accountService.deleteUser(id || owner.sub);
    return {
      message: 'User deleted successfully',
      code: 'USER_DELETED_SUCCESS',
    };
  }

  @Mutation(() => AccountEntity, { name: 'user' })
  async updateUser(
    @CurrentUser() owner: IUser,
    @Args('params', { nullable: true }) params: UserParams,
  ) {
    return this.accountService.updateUser(owner.sub, params as IAccountUser);
  }

  @Query(() => LoopbackResult, { nullable: true })
  async loopback(@CurrentUser() owner: IUser) {
    return { event: JSON.stringify(owner) };
  }

  // TODO not related to the player account, or create filters for inventory
  @UseGuards(UserGuard)
  @ResolveField(() => GameConnection, { nullable: true })
  games(
    @Args('params', { nullable: true }) params: GamesParams,
    @CurrentUser() user?: IUser,
  ) {
    return this.sourceService.getFilterMarketGames(params, user);
  }

  @ResolveField(() => UserConnection, { nullable: true })
  friends(
    @Parent() account: AccountEntity,
    @Args('params', { nullable: true }) params: FriendParams,
  ) {
    return this.friendService.getFriendsByUserId(account.id, params);
  }

  @Mutation(() => Success)
  logout(@CurrentUser() owner: IUser) {
    return this.accountService.logout(owner.sub);
  }

  @Mutation(() => Token)
  @CurrentUserRoles(RoleEnum.ADMIN)
  async access(
    @CurrentUser() admin: IUser,
    @Args('params') { email, id }: LoginByUserParams,
  ) {
    const { access_token, access_expires } = await this.accountService.access(
      admin.sub,
      email,
      id,
    );

    return { token: access_token, expires: access_expires };
  }

  @Mutation(() => String)
  async regeneratePlayerToken(@CurrentUser() user: IUser): Promise<string> {
    return this.accountService.regeneratePlayerToken(user);
  }

  @ResolveField(() => Int, { name: 'items_count', nullable: true })
  itemsCount(@Parent() account: AccountEntity) {
    return this.inventoryService.getItemsCountByWalletsList(account.wallets);
  }

  @ResolveField(() => Boolean, {
    name: 'is_friendship_requested',
    nullable: true,
  })
  async isFriendshipRequested(
    @Parent() account: AccountEntity,
    @CurrentUser() { sub }: IUser,
  ) {
    const currentUser = await this.accountService.getUserById(sub);
    const isFriendshipRequested = await this.friendService.isFriendRequestSent(
      currentUser.id,
      account.id,
    );
    return Boolean(isFriendshipRequested);
  }

  @ResolveField(() => Boolean, { name: 'is_friend', nullable: true })
  async isFriend(
    @Parent() account: AccountEntity,
    @CurrentUser() { sub }: IUser,
  ) {
    const currentUser = await this.accountService.getUserById(sub);
    const isFriend = await this.friendService.myFriend(
      currentUser.id,
      account.id,
    );
    return Boolean(isFriend);
  }

  @ResolveField(() => CardConnection, { nullable: true })
  inventory(
    @CurrentUser() owner: IUser,
    @Args('params', { nullable: true }) params: GetInventoryParams,
  ) {
    const userIdentify = params?.customUrl
      ? { customUrl: params.customUrl }
      : { userId: params?.userId || owner.sub };
    return this.inventoryService.getInventorOfUser({
      ...params,
      ...userIdentify,
    });
  }
}
