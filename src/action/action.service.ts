import { Injectable, Logger } from '@nestjs/common';
import {
  catchError,
  defer,
  forkJoin,
  from,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import {
  ActionTransactionEntity,
  ActionTypeEntity,
  UserActionEntity,
} from './models';
import { Success } from '../utils/interfaces/response.interface';
import {
  CreateActionTypeInput,
  GetNftInput,
  UpdateActionTypeInput,
  UserActionStatDto,
} from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { map } from 'rxjs/operators';
import { AddBonusInput } from './dto/add-bonus.input';
import { AccountEntity } from '../account/models/account.entity';
import { TxTypeEnum } from './enums';
import { UserVisitEntity } from '../account/models/user-visit.entity';

@Injectable()
export class ActionService {
  private logger = new Logger(ActionService.name);

  constructor(
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
    @InjectRepository(ActionTypeEntity)
    private actionTypeRepository: Repository<ActionTypeEntity>,
    @InjectRepository(UserActionEntity)
    private userActionRepository: Repository<UserActionEntity>,
    @InjectRepository(ActionTransactionEntity)
    private actionTxRepository: Repository<ActionTransactionEntity>,
    @InjectRepository(UserVisitEntity)
    private userVisitRepository: Repository<UserVisitEntity>,
  ) {}

  createActionType(
    params: CreateActionTypeInput,
  ): Observable<ActionTypeEntity> {
    const createActionTypeFactory = () =>
      this.actionTypeRepository.save({
        name: params.name,
        is_public: params.isPublic,
        limit: params.limit,
        amount: params.amount,
        is_infinity: params.isInfinity,
        is_required: params.isRequired,
      });

    return defer(createActionTypeFactory).pipe(
      tap((actionType) =>
        this.logger.debug(`createActionType => ${JSON.stringify(actionType)}`),
      ),
      catchError((err) => {
        this.logger.error(`createActionType => ${err.message}`);
        return of(null);
      }),
    );
  }

  updateActionType(
    params: UpdateActionTypeInput,
  ): Observable<ActionTypeEntity> {
    const updateActionTypeFactory = () =>
      this.actionTypeRepository.update(
        { id: params.id },
        {
          name: params.name,
          is_public: params.isPublic,
          limit: params.limit,
          amount: params.amount,
          is_infinity: params.isInfinity,
          is_required: params.isRequired,
        },
      );

    return defer(updateActionTypeFactory).pipe(
      tap((actionType) =>
        this.logger.debug(
          `updateActionType => ${JSON.stringify(actionType.affected > 0)}`,
        ),
      ),
      switchMap(() => {
        return from(this.actionTypeRepository.findOne(params.id));
      }),
      catchError((err) => {
        this.logger.error(`updateActionType => ${err.message}`);
        return of(null);
      }),
    );
  }

  removeActionType(id: number): Observable<Success> {
    const deleteActionTypeFactory = () => this.actionTypeRepository.delete(id);

    return defer(deleteActionTypeFactory).pipe(
      tap((deleteResult) =>
        this.logger.debug(`deleteActionType => ${deleteResult.affected > 0}`),
      ),
      map(() => ({
        code: 'ACTION_TYPE_DELETE_SUCCESS',
        message: 'Action type delete success',
      })),
      catchError((err) => {
        this.logger.error(`deleteActionType => ${err.message}`);
        return of({
          code: 'ACTION_TYPE_DELETE_FAILED',
          message: 'Action type delete failed',
        });
      }),
    );
  }

  getActions(): Observable<ActionTypeEntity[]> {
    const getActionsFactory = () => this.actionTypeRepository.find();

    return defer(getActionsFactory);
  }

  getNFT(params: GetNftInput): Observable<Success> {
    const { userId } = params;
    const getNFTFactory = () =>
      getManager().transaction<Success>(async () => {
        // TODO execute method mind NFT
        return {
          code: 'GET_NFT_SUCCESS',
          message: 'Get nft success',
        };
      });

    return defer(getNFTFactory).pipe(
      catchError((err) => {
        this.logger.error(`getNFT => ${err.message}`);

        return of({
          code: 'GET_NFT_FAILED',
          message: 'Get nft failed',
        });
      }),
    );
  }

  addBonus(params: AddBonusInput): Observable<Success> {
    const { actionId, userId } = params;
    const getUserFactory = () =>
      this.accountRepository.findOne({ where: { id: userId } });
    const getActionFactory = () =>
      this.actionTypeRepository.findOne({ where: { id: actionId } });
    const getUserActionFactory = () =>
      this.userActionRepository.find({
        where: { action_id: actionId, user_id: userId },
      });
    const getUserVisitFactory = () =>
      this.userVisitRepository.find({
        where: { user_id: userId },
      });

    return forkJoin([
      defer(getActionFactory),
      defer(getUserFactory),
      defer(getUserActionFactory),
      defer(getUserVisitFactory),
    ]).pipe(
      switchMap(([actionType, user, userActions]) => {
        if (!actionType) {
          return of({
            code: 'ACTION_NOT_FOUND',
            message: 'Action not found',
          });
        }
        if (!user) {
          return of({
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          });
        }

        const isAddTx = (userActions.length + 1) % +actionType.amount === 0;
        const count = Math.floor(userActions.length / actionType.amount);
        // if (
        //   actionType.id === Action.VISIT_GAME_TRADE_7_DAYS &&
        //   userVisits.length >= actionType.amount
        // ) {
        //   return {
        //     code: 'ACTION_ALREADY_USING',
        //     message: 'Action already using',
        //   };
        // }

        if (count >= +actionType.limit && !actionType.is_infinity) {
          return of({
            code: 'ACTION_ALREADY_USING',
            message: 'Action already using',
          });
        }

        return getManager().transaction<Success>(async (entityManager) => {
          if (isAddTx) {
            const tx = this.actionTxRepository.create();
            tx.action_id = actionType.id;
            tx.amount = actionType.amount;
            tx.user_id = userId;
            tx.type = TxTypeEnum.CREDIT;
            tx.balance = user.bonuses;

            await entityManager.save(ActionTransactionEntity, tx);
          }
          await entityManager.insert(UserActionEntity, {
            user_id: userId,
            action_id: actionType.id,
          });

          if (isAddTx) {
            return {
              code: 'ADD_BONUS_SUCCESS',
              message: 'Add bonus success',
            };
          }

          return {
            code: 'ADD_USER_ACTION_SUCCESS',
            message: 'Add user action success',
          };
        });
      }),
      catchError((err) => {
        this.logger.error(`addBonus => ${err.message}`);

        return of({
          code: 'ADD_BONUS_FAILED',
          message: 'Add bonus failed',
        });
      }),
    );
  }

  getUserStats(userId: string): Observable<UserActionStatDto[]> {
    if (!userId) {
      return of([]);
    }

    const getUserFactory = () =>
      this.accountRepository.findOne({
        select: ['bonuses'],
        where: { id: userId },
      });

    const getUserStatsFactory = () =>
      getManager().query(
        `select t.id,
                t.name,
                t.is_infinity,
                t.limit,
                t.amount,
                (select count(ua.id)
                 from account.user_actions ua
                 where ua.action_id = t.id
                   and ua.user_id = $1) count
         from inventory.actions_types t
        `,
        [userId],
      );

    return forkJoin([defer(getUserStatsFactory), defer(getUserFactory)]).pipe(
      switchMap(([actions, userInfo]) => {
        return of(
          actions.map((action) => ({
            actionId: action.id,
            actionName: action.name,
            amount: action.amount,
            limit: action.limit,
            isInfinity: action.is_infinity,
            count: Math.floor(action.count / action.amount),
            bonuses: userInfo.bonuses,
          })),
        );
      }),
    );
  }
}
