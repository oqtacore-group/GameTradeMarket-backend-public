import {
  CACHE_MANAGER,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  BuyInput,
  CreateUserInput,
  DeleteGameItemInput,
  GetGameCardMint,
  GetGameItemsInput,
  ImportContractInput,
  ImportTokenInput,
  PingActiveGameInput,
  UpdatePriceInput,
} from './interfaces/integration.input';
import { InjectRepository } from '@nestjs/typeorm';
import {
  InventoryEntity,
  SaleType,
} from '../inventory/models/inventory.entity';
import { Repository, getManager, Between, In, LessThan } from 'typeorm';
import { InventoryService } from '../inventory/inventory.service';
import { EventService } from '../event/event.service';
import { WalletEntity } from '../account/wallet/models/wallet.entity';
import { HttpService } from '@nestjs/axios';
import { ContractService } from '../inventory/contract.service';
import { Cache } from 'cache-manager';
import {
  CreateUserDto,
  GameCardMint,
  GetGameItemEdges,
  ImportContractDto,
  ImportItemDto,
} from './dto/integration.dto';
import { GetGamesWithNotExistsTokenDto } from './dto/get-games-with-not-exists-token.dto';
import { ActionService } from '../action/action.service';
import { Action } from '../action/enums';
import { BlogEntity } from '../blog/models/blog.entity';
import { CreateBlogParams } from '../blog/blog.interface';
import { mapCardToken } from 'src/inventory/helpers';
import { ListingEntity } from 'src/inventory/models/listing.entity';
import {
  isArray,
  isEthereumAddress,
  isNotEmpty,
  isNumber,
  isObject,
  isString,
  isURL,
} from 'class-validator';
import { ItemUpdateLogEntity } from 'src/inventory/models/item-update-log.entity';
import { AccessEntity } from 'src/account/models/access.entity';
import moment from 'moment';
import { sign } from 'jsonwebtoken';
import { DOMAIN } from '../utils/constants';
import { ConfigService } from '@nestjs/config';
import { AccessKeysGamesEntity } from '../account/models/access-keys-games.entity';
import { SourceUserActiveEntity } from '../source/models/source-user-active.entity';
import { GetOnlineFriendsDto } from './dto/get-online-friends.dto';
import { Token } from '../auth/dto/token.dto';
import { PlayerWalletDto } from './dto/player-wallet.dto';
import { FriendEntity } from '../account/friend/models/friend.entity';
import { GetPingActiveGameDto } from './dto/get-ping-active-game.dto';
import { UserAchievementEntity } from '../account/models/user-achievement.entity';
import { AchievementDto } from '../achievement/dto';
import { AchievementEntity } from '../achievement/models/achievement.entity';
import { ContractEntity } from 'src/inventory/models/contract.entity';
import { AccountEntity } from 'src/account/models/account.entity';
import { lastValueFrom } from 'rxjs';
import { GameInfoDto } from './dto/game-info.dto';
import { SourceEntity } from '../source/models/source.entity';
import { LaunchpadEntity } from 'src/inventory/models/minting.entity';

export enum Currency {
  ETH = 'ETH',
  MATIC = 'MATIC',
  USD = 'USD',
  BNB = 'BNB',
}

@Injectable()
export class IntegrationService {
  private logger = new Logger(IntegrationService.name);
  private lastInsert = new Date();
  private insertMutexLocked = false;
  private itemsToInsert = [];

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpService: HttpService,
    private actionService: ActionService,
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepository: Repository<InventoryEntity>,
    @InjectRepository(ItemUpdateLogEntity)
    private readonly itemUpdateLogRepository: Repository<ItemUpdateLogEntity>,
    @InjectRepository(BlogEntity)
    private readonly blogRepository: Repository<BlogEntity>,
    @InjectRepository(FriendEntity)
    private readonly friendEntityRepository: Repository<FriendEntity>,
    @InjectRepository(WalletEntity)
    private readonly walletEntityRepository: Repository<WalletEntity>,
    @InjectRepository(AchievementEntity)
    private readonly achievementEntityRepository: Repository<AchievementEntity>,
    private readonly inventoryService: InventoryService,
    private readonly contractService: ContractService,
    private readonly eventService: EventService,
    @InjectRepository(ContractEntity)
    private readonly contractRepository: Repository<ContractEntity>,
    @InjectRepository(SourceEntity)
    private readonly sourceRepository: Repository<SourceEntity>,
    @InjectRepository(AccessEntity)
    private readonly accessRepository: Repository<AccessEntity>,
    @InjectRepository(AccessKeysGamesEntity)
    private readonly accessKeysGamesRepository: Repository<AccessKeysGamesEntity>,
    @InjectRepository(AchievementEntity)
    private readonly achievementRepository: Repository<AchievementEntity>,
    @InjectRepository(UserAchievementEntity)
    private readonly userAchievementRepository: Repository<UserAchievementEntity>,
    @InjectRepository(SourceUserActiveEntity)
    private readonly sourceUserActiveRepository: Repository<SourceUserActiveEntity>,
    private configService: ConfigService,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(LaunchpadEntity)
    private readonly launchpadRepository: Repository<LaunchpadEntity>,
  ) {}

  async getGameInfo(game_code: string, user_id: string): Promise<GameInfoDto> {
    const found_game = await this.sourceRepository.findOne({
      where: { code: game_code },
    });
    const score_total = await this.achievementRepository.query(`
      select sum(score) scores from inventory.achievements
    `);
    const achievements = await this.achievementRepository.find({
      where: { game_code },
    });
    const score_quantity = achievements.reduce(
      (acc, achievement) => acc + achievement.score,
      0,
    );
    const user_achievements = await this.userAchievementRepository.find({
      relations: ['achievement'],
      where: { achievement: { game_code }, user_id },
    });
    const score_current = user_achievements.reduce((acc, user_achievement) => {
      return acc + user_achievement.achievement.score;
    }, 0);
    const date = new Date();
    const date_7 = new Date(date.setDate(date.getDate() + 7));
    const durations = await this.sourceUserActiveRepository.find({
      game_code,
      user_id,
      session_at: Between(date, date_7),
    });
    const week_2 = durations.reduce((acc, duration) => {
      return acc + duration.duration;
    }, 0);

    return {
      external_link: found_game.external_link,
      social_links: found_game.social_links,
      duration: {
        week_2,
      },
      score: {
        current: score_current,
        total: (score_total[0] && Number(score_total[0].scores)) || 0,
        quantity: score_quantity,
      },
      achievement: {
        current: user_achievements.length,
        current_percent: Math.ceil(
          (user_achievements.length / achievements.length) * 100,
        ),
        total: achievements.length,
      },
    };
  }

  async getUserAchievements(
    user_id: string,
    game_code: string,
  ): Promise<AchievementDto[]> {
    const user_achievements = await this.userAchievementRepository.find({
      relations: ['achievement'],
      where: {
        user_id,
        achievement: {
          game_code,
        },
      },
    });

    const achievements = await this.achievementRepository.find({
      where: { game_code },
    });

    return user_achievements.map((user_achievement) => ({
      total: achievements.length,
      ...user_achievement.achievement,
    }));
  }

  async createUserAchievement(
    achievement_id: number,
    user_id: string,
  ): Promise<void> {
    const achievement = await this.achievementEntityRepository.findOne({
      where: { id: achievement_id },
    });
    if (!isObject(achievement)) {
      throw new NotFoundException('No such achievement');
    }
    const user_achievement = await this.userAchievementRepository.findOne({
      where: { achievement_id, user_id },
    });
    if (user_achievement) {
      return;
    }

    await this.userAchievementRepository.save({
      achievement_id,
      user_id,
    });
  }

  async getOnlineFriends(
    user_id: string,
    game_code: string,
  ): Promise<GetOnlineFriendsDto[]> {
    const friends = await this.friendEntityRepository.find({
      relations: ['userFriend'],
      where: {
        owner: user_id,
      },
    });
    const filter_date = new Date();
    filter_date.setMinutes(filter_date.getMinutes() - 1);
    const friend_durations = await this.sourceUserActiveRepository.find({
      where: {
        user_id: In(friends.map((friend) => friend.userFriend.id)),
        game_code,
        session_at: LessThan(filter_date),
      },
    });
    const friend_achievements = await this.userAchievementRepository.find({
      relations: ['achievement'],
      where: {
        user_id: In(friends.map((friend) => friend.userFriend.id)),
        achievement: {
          game_code,
        },
      },
    });

    return friends
      .map((friend) => {
        const play_duration =
          (friend_durations.find(
            (friend_duration) =>
              friend_duration.user_id === friend.userFriend.id,
          )?.duration ?? 0) / 60;

        if (!play_duration) {
          return null;
        }

        return {
          id: friend.userFriend.id,
          nickname: friend.userFriend.nick_name,
          avatar: friend.userFriend.image_url,
          play_duration,
          achievements: friend_achievements.map(
            (userAchievement) => userAchievement.achievement,
          ),
        };
      })
      .filter(Boolean);
  }

  async pingActiveGame(
    data: PingActiveGameInput,
    user_id: string,
  ): Promise<void> {
    const ping = await this.sourceUserActiveRepository.findOne({
      user_id,
      game_code: data.game_code,
      session_at: new Date(),
    });

    if (!ping) {
      await this.sourceUserActiveRepository.save({
        user_id,
        game_code: data.game_code,
        duration: data.duration,
        session_at: new Date(),
      });
    } else {
      await this.sourceUserActiveRepository.update(
        {
          user_id,
          game_code: data.game_code,
          session_at: new Date(),
        },
        {
          duration: ping.duration + data.duration,
        },
      );
    }
  }

  async getPingActiveGame(
    game_code: string,
    user_id: string,
  ): Promise<GetPingActiveGameDto> {
    const result = await this.sourceUserActiveRepository.findOne({
      where: {
        user_id,
        game_code,
      },
    });

    return {
      total_time_min: Math.ceil(result?.duration / 60) ?? 0,
    };
  }

  async checkAccessKeyByGame(game_code: string, api_key: string) {
    const access_game_key = await this.accessKeysGamesRepository.findOne({
      where: { game_code, api_key },
    });
    if (!isObject(access_game_key)) {
      throw new ForbiddenException('Api key invalid for current game code');
    }
  }

  async getPlayerWallets(user_id: string): Promise<PlayerWalletDto[]> {
    const wallets = await this.walletEntityRepository.find({
      where: {
        user_id,
      },
    });

    return wallets.map((wallet) => ({
      address: wallet.address,
      name: wallet.name,
      networks: [],
    }));
  }

  async getBlogsUrls(): Promise<string[]> {
    const blogs = await this.blogRepository.find({ select: ['external_url'] });
    return blogs.map((blog) => blog.external_url);
  }

  async importBlog(params: CreateBlogParams): Promise<BlogEntity> {
    const blog = await this.blogRepository.save(params);
    return this.blogRepository.findOne({
      where: { id: blog.id },
    });
  }

  async generateOverlayToken(
    game_code: string,
    user_id: string,
  ): Promise<Token> {
    const privateKey = this.configService.get<string>(
      'PRIVATE_OVERLAY_JWT_KEY',
    );
    const now = moment();
    const amount = 60;
    now.add(amount, 'minutes');
    const user = await this.accountRepository.findOne({
      where: { id: user_id },
    });

    return {
      token: sign(
        {
          sub: user_id,
        },
        privateKey,
        {
          algorithm: 'HS256',
          issuer: DOMAIN,
          audience: game_code,
          expiresIn: `${amount}m`,
        },
      ),
      token_type: 'Bearer',
      expires: now.toDate(),
      user: {
        id: user_id,
        nick_name: user.nick_name,
      },
    };
  }

  async getItems(params: GetGameItemsInput): Promise<GetGameItemEdges> {
    const { game_code, contract, id, first: take, offset: skip } = params;
    const conditions: string[] = [];
    if (isString(id)) {
      conditions.push('i.id = :id');
    }
    if (isString(game_code)) {
      conditions.push('c.game_code = :game_code');
    }
    if (isEthereumAddress(contract)) {
      conditions.push('i.contract = :contract');
    }
    if (!isNotEmpty(id) && !isNotEmpty(game_code) && !isNotEmpty(contract)) {
      return {
        node: [],
      };
    }

    const [items] = await this.inventoryRepository
      .createQueryBuilder('i')
      .innerJoinAndSelect('i.contractData', 'c')
      .innerJoinAndSelect('c.source', 's')
      .innerJoinAndSelect('c.network', 'n')
      .where(conditions.join(' and '), {
        game_code,
      })
      .offset(skip ?? 0)
      .limit(take ?? 20)
      .getManyAndCount();

    return {
      node: items.map((item) => mapCardToken(item)),
    };
  }

  async deleteItem(
    params: DeleteGameItemInput,
    user_id: string,
  ): Promise<boolean> {
    if (!isObject(params) || !isEthereumAddress(params.contract)) {
      return false;
    }
    const { token_value, contract } = params;
    try {
      const token = await this.inventoryRepository.findOne({
        where: {
          token_value,
          contract,
        },
      });
      const foundContract = await this.contractService.getContractById(
        params?.contract,
      );
      await getManager().transaction(async (t) => {
        await t.delete(ListingEntity, { item_id: token.id });
        await t.delete(InventoryEntity, { id: token.id });
        await t.save(ItemUpdateLogEntity, {
          item_id: token.id,
          action: 'DEL',
          game_code: foundContract.game_code,
          created_at: new Date(),
          token_value,
          contract,
          user_id,
        });
      });

      return true;
    } catch (error) {
      this.logger.error(error.message, error.stack);

      return false;
    }
  }

  async importItem(
    params: ImportTokenInput,
    user_id: string,
  ): Promise<ImportItemDto> {
    let response;
    this.itemsToInsert = this.itemsToInsert.filter(
      (_item) =>
        _item.params.token_value !== params.token_value &&
        _item.params.contract !== params.contract,
    );
    this.itemsToInsert.push({ params, user_id });
    if (this.insertMutexLocked) {
      return {
        status: true,
        message: "Item's enlisted",
      };
    }

    this.insertMutexLocked = true;
    if (Date.now() >= this.lastInsert.getTime() + 1000) {
      response = await this.startImport();
      this.lastInsert = new Date();
      this.itemsToInsert = [];
    } else {
      response = {
        status: true,
        message: "Item's enlisted",
      };
    }
    this.insertMutexLocked = false;
    return response;
  }

  async startImport() {
    try {
      const itemsToInsert = this.itemsToInsert.map(({ params, user_id }) => {
        return {
          token_value: params?.token_value,
          contract: params?.contract,
          game_code: params?.game_code,
          user_id,
        };
      });
      await getManager().transaction(async (manager) => {
        const upsertTokens = await manager.upsert(
          InventoryEntity,
          this.itemsToInsert.map(({ params }) => {
            return {
              blockchain: params.blockchain,
              token_value: params.token_value,
              contract: params.contract,
              wallet: params.owner,
              token_uri: params.token_url ?? '',
              price: Boolean(params?.price)
                ? Math.trunc(params.price * 10 ** 18)
                : null,
              attributes: {
                name: params.name,
                description: params.description ?? '',
                picture: params.image_uri,
                attributes: params?.attributes,
                token_url: params?.token_url,
                token_tx_data: params?.token_tx_data,
                animation_url: params?.animation_url ?? '',
                history_price: params?.history_price,
              },
              game_code: params.game_code ?? '',
              sale_type: SaleType.FIXED_PRICE,
              fee: params.fee,
              approved: params.approved ?? false,
              platform: params.platform ?? 'SEAPORT', // 'OPENSEA'
              coin_address: params?.coin_address ?? null,
              item_data: params?.item_data,
              trade_contract: null,
            };
          }),
          {
            conflictPaths: ['token_value', 'contract'],
          },
        );

        for await (const _upsertToken of upsertTokens?.generatedMaps) {
          const timeDifference =
            new Date().getTime() -
            new Date(_upsertToken?.create_time).getTime();

          const _tokenInfo = await manager.findOne(InventoryEntity, {
            where: {
              id: _upsertToken?.id,
            },
          });

          const _item = itemsToInsert.find(
            (i) =>
              i.contract === _tokenInfo.contract &&
              i.token_value === _tokenInfo.token_value,
          );

          await manager
            .create(ItemUpdateLogEntity, {
              item_id: _tokenInfo?.id,
              action: timeDifference > 5 * 60 * 1000 ? 'UPD' : 'ADD',
              game_code: _item.game_code
                ? _item.game_code
                : _tokenInfo.game_code
                ? _tokenInfo.game_code
                : '',
              created_at: new Date(),
              token_value: _tokenInfo.token_value,
              contract: _tokenInfo.contract,
              price: _tokenInfo.price,
              user_id: _item && _item?.user_id ? _item?.user_id : '',
            })
            .save();
        }
      });
      return {
        status: true,
        message: 'UPSERT' + ` (${this.itemsToInsert?.length} item)`,
      };
    } catch (err) {
      this.logger.error(err.message);
      return { status: false, message: err.message };
    }
  }

  toFixed(x) {
    if (Math.abs(x) < 1.0) {
      const e = parseInt(x.toString().split('e-')[1]);
      if (e) {
        x *= Math.pow(10, e - 1);
        x = '0.' + new Array(e).join('0') + x.toString().substring(2);
      }
    } else {
      let e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
        e -= 20;
        x /= Math.pow(10, e);
        x += new Array(e + 1).join('0');
      }
    }
    return x;
  }

  async updatePrice(params: UpdatePriceInput): Promise<boolean> {
    try {
      this.logger.debug(JSON.stringify(params));
      const currency = await this.inventoryService.getCurrencyByContract(
        params.contract,
      );
      const rate = await this.inventoryService.convertCurrency(
        params.currency,
        currency,
      );

      const token = await this.inventoryRepository.findOne({
        token_value: params.token_value,
        contract: params.contract,
      });

      if (!token?.id) {
        return false;
      }

      const price = params.price * rate * 10 ** 18;
      const fee = params.fee * rate * 10 ** 18;
      await this.inventoryRepository.update(
        {
          id: token.id,
        },
        {
          price: isNumber(price) ? +price : null,
          fee: +fee,
        },
      );

      return true;
    } catch (err) {
      this.logger.error(err.message);

      return false;
    }
  }

  async buy(params: BuyInput): Promise<boolean> {
    try {
      const wallet = await this.walletEntityRepository.findOne({
        relations: ['user'],
        where: { address: params.owner },
      });

      const token = await this.inventoryRepository.findOne({
        token_value: params.token_value,
        contract: params.contract,
      });

      if (!token?.id) return false;

      await this.inventoryRepository.update(
        {
          id: token.id,
        },
        {
          price: null,
          fee: null,
          wallet: params.owner,
          approved: false,
        },
      );

      await this.actionService.addBonus({
        userId: wallet.user_id,
        actionId: Action.BUY_ITEM,
      });

      this.eventService.sendNotifyBuyToken(wallet?.user, token).then();
      return true;
    } catch {
      return false;
    }
  }

  async getGamesWithNotExistsTokens(): Promise<
    GetGamesWithNotExistsTokenDto[]
  > {
    return this.contractService.getGamesWithNotExistsTokens();
  }

  async getAllUsersWallets() {
    return this.walletEntityRepository.find({
      select: ['address'],
    });
  }

  async importContract(
    params: ImportContractInput,
  ): Promise<ImportContractDto> {
    const { game_code, contract, blockchain, platform } = params;
    try {
      const foundContract = await this.contractRepository.findOne({
        where: { game_code, contract, blockchain },
      });
      if (isObject(foundContract)) {
        return {
          status: false,
          message: 'Contract already exists',
        };
      }
      await this.contractRepository
        .create({
          game_code,
          contract,
          blockchain,
          platform,
        })
        .save();
      return {
        status: true,
      };
    } catch (err) {
      this.logger.error(err.message);
      return {
        status: false,
        message: err.message,
      };
    }
  }

  async createUser(params: CreateUserInput): Promise<CreateUserDto> {
    try {
      const { nick_name, custom_url, image_url, email, last_visited } = params;
      const account = await this.accountRepository.findOne({
        where: { email },
      });
      if (!isObject(account)) {
        await this.accountRepository
          .create({
            email,
            nick_name,
            custom_url,
            image_url,
            last_visited,
          })
          .save();
      } else {
        await this.accountRepository.update(
          {
            id: account.id,
          },
          {
            last_visited,
            image_url,
          },
        );
      }

      return {
        status: true,
      };
    } catch (err) {
      this.logger.error(err.message);

      return {
        status: false,
        message: err.message,
      };
    }
  }

  async getGameCardMint(params: GetGameCardMint): Promise<GameCardMint> {
    const { code } = params;

    const source = await this.launchpadRepository.findOne({
      where: {
        game_code: code,
      },
    });
    if (!source) {
      return null;
    }

    return {
      ...source,
    };
  }

  async getGameCardsMint(): Promise<GameCardMint[]> {
    const cache = await this.cacheManager.get('launch');

    if (isArray(cache)) {
      return cache;
    }
    const source = await this.launchpadRepository.find();
    const gameCardsMint = [];
    for (const item of source) {
      if (!item.is_hidden) {
        const usdPrice = await this.getExchangeRatesByCurrency(
          item.start_price.split(' ')[1] as Currency,
        );

        const gameCardMint = {
          ...item,
          usd_price: usdPrice,
        };

        gameCardsMint.push(gameCardMint);
      }
    }

    await this.cacheManager.set('launch', gameCardsMint);

    return gameCardsMint;
  }

  async getExchangeRatesByCurrency(currency: Currency): Promise<number> {
    if (!currency) {
      return 0;
    }
    const cache = await this.cacheManager.get('rates');
    if (cache) {
      return cache[currency] ?? 0;
    }
    const response = await lastValueFrom(
      this.httpService.get(`https://blockchain.info/ticker?base=${currency}`),
    );
    if (response.status === 200) {
      const rates = { [currency]: response.data['USD']?.last ?? 0 };
      await this.cacheManager.set(
        'rates',
        cache ? { ...cache, ...rates } : { ...rates },
        600000,
      );
      return response.data['USD']?.last ?? 0;
    }
    return 0;
  }
}
