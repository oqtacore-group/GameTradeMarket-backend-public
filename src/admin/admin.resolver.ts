import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { InventoryService } from '../inventory/inventory.service';
import {
  StatisticsResponse,
  GameItemsResponse,
  GameItemsParams,
} from './interfaces/admin.interface';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUserRoles, RoleEnum } from '../role/role.decorator';
import {
  ListingsDto,
  ActivitiesDto,
  ActivityInput,
  Logs,
  CountItems,
  CountLogs,
  LogParams,
} from './dto';

@UseGuards(AuthGuard)
@Resolver()
export class AdminResolver {
  constructor(
    private readonly adminService: AdminService,
    private readonly inventoryService: InventoryService,
  ) {}

  @Query(() => StatisticsResponse, { name: 'statisticsAdmin' })
  @CurrentUserRoles(RoleEnum.ADMIN)
  async getStatistics() {
    return await this.adminService.getStatistics();
  }

  @Query(() => [GameItemsResponse], { name: 'gameItemsAdmin' })
  @CurrentUserRoles(RoleEnum.ADMIN)
  async getGameItems(@Args('params') params: GameItemsParams) {
    const items = await this.inventoryService.getItemsBySource(params);

    return items.map((item: any) => {
      return {
        id: item.id,
        contract: item.contract,
        description: item.attributes?.description,
      };
    });
  }

  @Query(() => CountItems)
  async gameItemsCount(@Args('params') params: GameItemsParams) {
    const total = this.inventoryService.getItemsBySourceCount(params.gameCode);
    return { total };
  }

  @Query(() => Logs)
  @CurrentUserRoles(RoleEnum.ADMIN)
  logs(@Args('params') params: LogParams): Promise<Logs> {
    return this.adminService.getLogs(params);
  }

  @Query(() => CountLogs)
  async logsCount() {
    const total = this.adminService.getLogsCount();
    return { total };
  }

  @Query(() => [ListingsDto])
  @CurrentUserRoles(RoleEnum.ADMIN)
  listings(): Promise<ListingsDto[]> {
    return this.adminService.getListings();
  }

  @Query(() => [ListingsDto])
  @CurrentUserRoles(RoleEnum.ADMIN)
  sales(): Promise<ListingsDto[]> {
    return this.adminService.getSales();
  }

  @Query(() => ActivitiesDto)
  @CurrentUserRoles(RoleEnum.ADMIN)
  activity(@Args('params') params: ActivityInput): Promise<ActivitiesDto> {
    return this.adminService.getActivity(params);
  }

  @Mutation(() => Boolean)
  @CurrentUserRoles(RoleEnum.ADMIN)
  async buyToken(): Promise<boolean> {
    return this.adminService.buyRandomToken();
  }
}
