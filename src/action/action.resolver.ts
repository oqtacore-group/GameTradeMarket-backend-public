import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ActionTypeEntity } from './models';
import { Observable } from 'rxjs';
import {
  CreateActionTypeInput,
  GetNftInput,
  RemoveActionTypeInput,
  UpdateActionTypeInput,
  UserActionStatDto,
  UserActionStatsInput,
} from './dto';
import { Success } from '../utils/interfaces/response.interface';
import { ActionService } from './action.service';
import { AuthGuard, CurrentUser, UserGuard } from '../auth/auth.guard';
import { RoleGuard } from '../role/role.guard';
import { CurrentUserRoles, RoleEnum } from '../role/role.decorator';
import { UseGuards } from '@nestjs/common';
import { IUser } from '../auth/interfaces/user.interface';
import { AddBonusInput } from './dto/add-bonus.input';

@Resolver(() => ActionTypeEntity)
export class ActionResolver {
  constructor(private actionService: ActionService) {}

  @Query(() => [ActionTypeEntity], { defaultValue: [] })
  getActions(): Observable<ActionTypeEntity[]> {
    return this.actionService.getActions();
  }

  // @UseGuards(AuthGuard, RoleGuard)
  // @CurrentUserRoles(RoleEnum.ADMIN)
  @Mutation(() => ActionTypeEntity, { nullable: true })
  createActionType(
    @Args('params') params: CreateActionTypeInput,
  ): Observable<ActionTypeEntity> {
    return this.actionService.createActionType(params);
  }

  // @UseGuards(AuthGuard, RoleGuard)
  // @CurrentUserRoles(RoleEnum.ADMIN)
  @Mutation(() => ActionTypeEntity, { nullable: true })
  updateActionType(
    @Args('params') params: UpdateActionTypeInput,
  ): Observable<ActionTypeEntity> {
    return this.actionService.updateActionType(params);
  }

  // @UseGuards(AuthGuard, RoleGuard)
  // @CurrentUserRoles(RoleEnum.ADMIN)
  @Mutation(() => Success)
  removeActionType(
    @Args('params') params: RemoveActionTypeInput,
  ): Observable<Success> {
    return this.actionService.removeActionType(params.id);
  }

  @Mutation(() => Success)
  getNFT(@Args('params') params: GetNftInput): Observable<Success> {
    return this.actionService.getNFT(params);
  }

  @UseGuards(UserGuard)
  @Query(() => [UserActionStatDto], { nullable: 'items' })
  userActionStats(
    @Args('params', { nullable: true }) params: UserActionStatsInput,
    @CurrentUser() user?: IUser,
  ): Observable<UserActionStatDto[]> {
    const userId = params.userId ?? user.sub;
    return this.actionService.getUserStats(userId);
  }

  @Mutation(() => Success)
  addBonusTest(@Args('params') params: AddBonusInput): Observable<Success> {
    return this.actionService.addBonus(params);
  }
}
