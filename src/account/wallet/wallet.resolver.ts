import {
  Mutation,
  Query,
  Resolver,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { WalletService } from './wallet.service';
import {
  WalletParams,
  WalletUpdateParams,
} from './interfaces/connect-wallet.input';
import { CurrentUserRoles, RoleEnum } from '../../role/role.decorator';
import { DisconnectWalletArgs } from './interfaces/disconnect-wallet.args';
import { UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser } from '../../auth/auth.guard';
import { IUser } from '../../auth/interfaces/user.interface';
import { WalletEntity } from './models/wallet.entity';
import { BalanceService } from './balance.service';
import { Wallet, CountWallets } from './dto/wallet.dto';
import { Currency } from './dto/currency.dto';
import { Success } from '../../utils/interfaces/response.interface';
import { AccountEntity } from '../models/account.entity';
import { AccountService } from '../account.service';
import { WalletFilters } from './interfaces/wallet.input';

@UseGuards(AuthGuard)
@Resolver(() => Wallet)
export class WalletResolver {
  constructor(
    private readonly balanceService: BalanceService,
    private readonly walletService: WalletService,
    private readonly accountService: AccountService,
  ) {}

  @Query(() => [Wallet], { nullable: true })
  myWallets(@CurrentUser() user: IUser) {
    return this.walletService.myWallets(user.sub);
  }

  @Query(() => [Wallet], { nullable: true })
  @CurrentUserRoles(RoleEnum.ADMIN)
  wallets(@Args('params', { nullable: true }) params: WalletFilters) {
    return this.walletService.getWallets(params);
  }

  @Query(() => CountWallets)
  async walletsCount() {
    const total = this.walletService.getWalletsCount();
    return { total };
  }

  @Mutation(() => Success)
  connectWallet(
    @CurrentUser() user: IUser,
    @Args('params') payload: WalletParams,
  ) {
    return this.walletService.connect({
      ...payload,
      user_id: user.sub,
    } as WalletEntity);
  }

  @Mutation(() => Success)
  disconnectWallet(
    @CurrentUser() user: IUser,
    @Args() { address }: DisconnectWalletArgs,
  ) {
    return this.walletService.disconnect(user.sub, address);
  }

  @Mutation(() => Wallet, { name: 'wallet' })
  async updateWallet(
    @CurrentUser() user: IUser,
    @Args('params', { nullable: true }) { name, address }: WalletUpdateParams,
  ) {
    return this.walletService.updateWallet({
      user_id: user.sub,
      name,
      address,
    } as WalletEntity);
  }

  @Query(() => [Currency], { nullable: true })
  async getBalances(
    @CurrentUser() user: IUser,
    @Args('address', { type: () => String }) address: string,
  ) {
    return this.balanceService.getBalances([address]);
  }

  @ResolveField(() => [Currency], { nullable: true })
  balances(@Parent() wallet: WalletEntity) {
    return this.balanceService.getBalances([wallet.address]);
  }

  @ResolveField(() => AccountEntity)
  user(@Parent() wallet: WalletEntity) {
    return this.accountService.getUserById(wallet.user_id);
  }
}
