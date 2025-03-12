import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import moment from 'moment/moment';
import { getManager, In, Repository } from 'typeorm';
import { isArray, isBoolean, isObject, isString } from 'class-validator';
import { Success } from '../utils/interfaces/response.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ContractEntity } from '../inventory/models/contract.entity';
import {
  AddSourceInput,
  CatalogGameParams,
  ContractsListParams,
  GameCardParams,
  GamesParams,
  RemoveSourceInput,
  UpdateSourceInput,
} from './interfaces/source.input';
import {
  AppLinkKind,
  GameConnection,
  GameFilter,
  GameFilterValue,
  Genre,
} from './dto/source.dto';
import { SourceEntity } from './models/source.entity';
import { ConfigService } from '@nestjs/config';
import { AccountService } from '../account/account.service';
import { SourceUserEntity } from './models/source-user.entity';
import {
  AddPublisherOfSourceInput,
  PublisherUsersParams,
  RemovePublisherOfSourceInput,
} from './interfaces/source-user.input';
import { IUser } from '../auth/interfaces/user.interface';
import { Currency } from '../inventory/interfaces/card.interface';
import { GameCard } from './dto/game-card.dto';
import { ReviewService } from '../review/review.service';
import { CatalogGameConnection } from './dto/catalog-game-connection.dto';
import { ContractRemoveInput } from './dto/contract-remove.input';
import { FilterType } from 'src/inventory/interfaces/market.interface';
import { ContractCreateInput } from './dto/contract-create.input';
import { SourceGenreEntity } from './models/source-genre.entity';
import { GenreEntity } from '../genre/models/genre.entity';
import { SourceStateTypeEnum } from './types/source-state.type';
import { formatGameNameForSitemapFn } from './helpers';
import { SourceCurrencyEntity } from './models/source-currency.entity';
import { NetworkEntity } from '../blockchain/models/network.entity';
import { ExchangeService } from '../exchange/exchange.service';
import { InventoryService } from '../inventory/inventory.service';
import { SecretManagerService } from '../utils/secret-manager/secret-manager.service';
import { Blockchain } from '../blockchain/interfaces/blockchain.interface';
import { BigQuery } from '@google-cloud/bigquery';
import { isUndefined } from '@nestjs/common/utils/shared.utils';
import { CatalogGameStats } from './dto/catalog-game-stats.dto';

@Injectable()
export class SourceService {
  private logger = new Logger(SourceService.name);
  private _bigquery_config: any;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly accountService: AccountService,
    private readonly reviewService: ReviewService,
    private readonly exchangeService: ExchangeService,
    private readonly inventoryService: InventoryService,
    @InjectRepository(NetworkEntity)
    private readonly networkRepository: Repository<NetworkEntity>,
    @InjectRepository(SourceEntity)
    private readonly sourceRepository: Repository<SourceEntity>,
    @InjectRepository(SourceCurrencyEntity)
    private readonly sourceCurrencyRepository: Repository<SourceCurrencyEntity>,
    @InjectRepository(SourceUserEntity)
    private readonly sourceUserRepository: Repository<SourceUserEntity>,
    @InjectRepository(SourceGenreEntity)
    private readonly sourceGenreEntityRepository: Repository<SourceGenreEntity>,
    @InjectRepository(GenreEntity)
    private readonly genreEntityRepository: Repository<GenreEntity>,
    @InjectRepository(ContractEntity)
    private readonly contractRepository: Repository<ContractEntity>,
    readonly secretManager: SecretManagerService,
  ) {}

  async onApplicationBootstrap() {
    this._bigquery_config = await this.secretManager.getSecretValue(
      'GOOGLE_APPLICATION_CREDENTIALS',
    );
  }

  async getGameStats(gameCode: string): Promise<CatalogGameStats> {
    const [
      getTxCountBy7dCache,
      getTxCountBy30dCache,
      getUawBy7dCache,
      getUawBy30dCache,
    ] = await Promise.all([
      this.cacheManager.get(`${gameCode}:getTxCountBy7d`),
      this.cacheManager.get(`${gameCode}:getTxCountBy30d`),
      this.cacheManager.get(`${gameCode}:getUawBy7d`),
      this.cacheManager.get(`${gameCode}:getUawBy30d`),
    ]);

    if (
      !isUndefined(getTxCountBy7dCache) ||
      !isUndefined(getTxCountBy30dCache) ||
      !isUndefined(getUawBy7dCache) ||
      !isUndefined(getUawBy30dCache)
    ) {
      this.logger.debug('cache loaded');
      return {
        uaw_7d: getUawBy7dCache || 0,
        uaw_30d: getUawBy30dCache || 0,
        tx_7d: getTxCountBy7dCache || 0,
        tx_30d: getTxCountBy30dCache || 0,
      };
    }

    const contracts = await this.contractRepository.find({
      relations: ['network'],
      where: {
        game_code: gameCode,
        network: {
          code: In([Blockchain.ETHEREUM, Blockchain.POLYGON]),
        },
      },
    });

    const contractIds = contracts.map((contract) => contract.contract);

    const bigqueryClient = new BigQuery({
      projectId: this._bigquery_config.project_id,
      credentials: {
        client_email: this._bigquery_config.client_email,
        private_key: this._bigquery_config.private_key,
      },
    });
    const startDate = moment();
    const value7d = startDate.subtract(7, 'd').format('YYYY-MM-DD');
    const value30d = startDate.subtract(30, 'd').format('YYYY-MM-DD');
    const [
      polygonUawBy7d,
      ethereumUawBy7d,
      polygonUawBy30d,
      ethereumUawBy30d,
      polygonTxCountBy30d,
      ethereumTxCountBy30d,
      polygonTxCountBy7d,
      ethereumTxCountBy7d,
    ] = await Promise.all([
      bigqueryClient.query({
        query: `
        SELECT count(distinct from_address) FROM bigquery-public-data.crypto_polygon.transactions 
        WHERE DATE(block_timestamp) > "${value7d}" and 
        to_address in ('${contractIds.join("','")}')
      `,
        location: 'US',
      }),
      bigqueryClient.query({
        query: `
        SELECT count(distinct from_address) FROM bigquery-public-data.crypto_ethereum.transactions 
        WHERE DATE(block_timestamp) > "${value7d}" and 
        to_address in ('${contractIds.join("','")}')
      `,
        location: 'US',
      }),
      bigqueryClient.query({
        query: `
        SELECT count(distinct from_address) FROM bigquery-public-data.crypto_polygon.transactions 
        WHERE DATE(block_timestamp) > "${value30d}" and 
        to_address in ('${contractIds.join("','")}')
      `,
        location: 'US',
      }),
      bigqueryClient.query({
        query: `
        SELECT count(distinct from_address) FROM bigquery-public-data.crypto_ethereum.transactions 
        WHERE DATE(block_timestamp) > "${value30d}" and 
        to_address in ('${contractIds.join("','")}')
      `,
        location: 'US',
      }),
      bigqueryClient.query({
        query: `
        SELECT count(*) FROM bigquery-public-data.crypto_polygon.transactions 
        WHERE DATE(block_timestamp) > "${value30d}" and 
        to_address in ('${contractIds.join("','")}')
      `,
        location: 'US',
      }),
      bigqueryClient.query({
        query: `
        SELECT count(*) FROM bigquery-public-data.crypto_ethereum.transactions 
        WHERE DATE(block_timestamp) > "${value30d}" and 
        to_address in ('${contractIds.join("','")}')
      `,
        location: 'US',
      }),
      bigqueryClient.query({
        query: `
        SELECT count(*) FROM bigquery-public-data.crypto_polygon.transactions 
        WHERE DATE(block_timestamp) > "${value7d}" and 
        to_address in ('${contractIds.join("','")}')
      `,
        location: 'US',
      }),
      bigqueryClient.query({
        query: `
        SELECT count(*) FROM bigquery-public-data.crypto_ethereum.transactions 
        WHERE DATE(block_timestamp) > "${value7d}" and 
        to_address in ('${contractIds.join("','")}')
      `,
        location: 'US',
      }),
    ]);

    const uaw_7d =
      Number(polygonUawBy7d[0]?.[0]?.f0_) +
      Number(ethereumUawBy7d[0]?.[0]?.f0_);
    const uaw_30d =
      Number(polygonUawBy30d[0]?.[0]?.f0_) +
      Number(ethereumUawBy30d[0]?.[0]?.f0_);
    const tx_7d =
      Number(polygonTxCountBy7d[0]?.[0]?.f0_) +
      Number(ethereumTxCountBy7d[0]?.[0]?.f0_);
    const tx_30d =
      Number(polygonTxCountBy30d[0]?.[0]?.f0_) +
      Number(ethereumTxCountBy30d[0]?.[0]?.f0_);

    const ttl = 43200; // sec
    await Promise.all([
      this.cacheManager.set(`${gameCode}:getUawBy7d`, uaw_7d, ttl),
      this.cacheManager.set(`${gameCode}:getUawBy30d`, uaw_30d, ttl),
      this.cacheManager.set(`${gameCode}:getTxCountBy7d`, tx_7d, ttl),
      this.cacheManager.set(`${gameCode}:getTxCountBy30d`, tx_30d, ttl),
    ]);
    this.logger.debug(`cache saved ${ttl}`);

    return {
      uaw_7d,
      uaw_30d,
      tx_7d,
      tx_30d,
    };
  }

  async getRating(card: GameCard): Promise<number> {
    return this.reviewService.getRatingBySource(card.code);
  }

  async getCurrencies(card: GameCard): Promise<SourceCurrencyEntity[]> {
    return this.sourceCurrencyRepository.find({
      relations: ['coin', 'coin.network'],
      where: {
        game_code: card.code,
        coin: {
          network: {
            is_enabled: true,
          },
        },
      },
    });
  }

  async getGenres(card: GameCard): Promise<Genre[]> {
    const cache = await this.cacheManager.get(`${card.code}:genres`);

    if (cache) {
      return cache;
    }
    const sourceGenres = await this.sourceGenreEntityRepository.find({
      relations: ['genre'],
      where: {
        game_code: card.code,
      },
    });

    const foundGenres = sourceGenres.map((sourceGenre) => sourceGenre.genre);
    await this.cacheManager.set(`${card.code}:genres`, foundGenres, {
      ttl: 43200,
    });

    return foundGenres;
  }

  async getReviewCount(card: GameCard): Promise<number> {
    return this.reviewService.getReviewCountBySource(card.code);
  }

  async getFilterMarketGames(
    params: GamesParams,
    user?: IUser,
  ): Promise<GameConnection> {
    const conditions = [];

    if (isObject(user)) {
      conditions.push(`exists(select 1 from inventory.items d
        join inventory.contracts c on c.contract = d.contract  
        where c.game_code = s.code and d.wallet in
        (select w.address from account.user_wallets w where w.user_id = '${user.sub}'))
      `);
    }

    if (params?.contract) {
      conditions.push(
        `exists(select 1 from inventory.contracts c where c.game_code = s.code and c.contract = '${params.contract}')`,
      );
    }

    if (params?.blockchain) {
      conditions.push(
        `exists(select 1 from inventory.contracts c where c.game_code = s.code and c.blockchain = '${params.blockchain}')`,
      );
    }

    if (params?.gameCode) {
      conditions.push(`s.code = '${params.gameCode}'`);
    }

    let conditionGameCode = '',
      conditionTableCode = '';
    if (params?.name) {
      conditions.push(`s.name ilike '${params.name.split('-').join(' ')}'`);
      (conditionGameCode = ''), (conditionTableCode = '');
    }

    const res = await getManager().query(`
        select count(s.code)
        from inventory.sources s
            ${conditions.length ? `where ${conditions.join(' and ')}` : ''}
    `);

    const node = await getManager().query(`
      select distinct s.code, s.name${conditionTableCode}
      from inventory.sources s
      ${conditionGameCode}
      ${conditions.length ? `where ${conditions.join(' and ')}` : ''} ${
      params?.first
        ? `limit ${params?.first} offset ${params?.offset * params?.first}`
        : ''
    }
    `);
    const len = res[0]?.count;

    return {
      totalCount: len,
      edges: {
        node,
      },
      pageInfo: {
        hasNextPage: params?.first * params?.offset + params?.first < len,
      },
    };
  }

  getGamesCount(): Promise<number> {
    return this.sourceRepository.count({ where: { hidden: true } });
  }

  async getFilters(): Promise<GameFilter[]> {
    const cache = await this.cacheManager.get('filters');

    if (isArray(cache)) {
      return cache;
    }
    const genres = await this.genreEntityRepository.find();
    const networks = await this.networkRepository.find({
      where: { is_enabled: true },
    });

    const years = await getManager().query(
      `select distinct s.release_date
       from inventory.sources s
       order by 1 desc`,
    );

    const unqYears: string[] = Array.from(
      new Set(
        years
          .filter((value) => !!value.release_date)
          .map((release_date) => {
            try {
              return moment(release_date).year();
            } catch {
              return release_date;
            }
          }),
      ),
    );

    const genresItems = genres.map((genre) => ({
      code: genre.code,
      title: genre.name,
      disable: false,
      checked: false,
    }));

    const gameStatuses = Object.entries(SourceStateTypeEnum).map(
      ([code, title]) => ({
        code,
        title,
        disable: false,
        checked: false,
      }),
    );

    const yearsItems: GameFilterValue[] = unqYears
      .map((year) => ({
        code: year,
        title: year,
        disable: false,
        checked: false,
      }))
      .sort();

    const devices: GameFilterValue[] = Object.entries(AppLinkKind).map(
      ([title, code]) => ({
        code,
        title: title.charAt(0).toUpperCase() + title.toLowerCase().slice(1),
        disable: false,
        checked: false,
      }),
    );

    const blockchains: GameFilterValue[] = networks.map(({ code, name }) => ({
      code,
      title: name,
      disable: false,
      checked: false,
    }));

    const priceModel: GameFilterValue[] = [
      {
        title: 'Free to play',
        code: 'is_free_to_play',
        checked: false,
        disable: false,
      },
      {
        title: 'NFT required',
        code: 'is_nft_required',
        checked: false,
        disable: false,
      },
      {
        title: 'Game required',
        code: 'is_game_required',
        checked: false,
        disable: false,
      },
      {
        title: 'Crypto required',
        code: 'is_crypto_required',
        checked: false,
        disable: false,
      },
    ];

    const friendInGames: GameFilterValue[] = [
      {
        title: 'Friend in game',
        code: 'is_friend_in_game',
        checked: false,
        disable: false,
      },
    ];

    const floorPrices: GameFilterValue[] = [
      {
        code: Currency.ETH,
        title: Currency.ETH,
        checked: true,
        disable: false,
      },
      {
        code: Currency.MATIC,
        title: Currency.MATIC,
        checked: false,
        disable: false,
      },
    ];

    const playAndEarn: GameFilterValue[] = [
      {
        title: 'Play & Earn NFT',
        code: 'is_play_to_earn_nft',
        checked: false,
        disable: false,
      },
      {
        title: 'Play & Earn Crypto',
        code: 'is_play_to_earn_crypto',
        checked: false,
        disable: false,
      },
    ];

    const filters = [
      {
        items: genresItems,
        key: 'GENRE',
        title: 'Genre',
        type: FilterType.CHECKBOX,
      },
      {
        items: blockchains,
        key: 'BLOCKCHAIN',
        title: 'Blockchain',
        type: FilterType.CHECKBOX,
      },
      {
        items: floorPrices,
        key: 'FLOOR_PRICE',
        title: 'Floor price',
        type: FilterType.MIN_MAX,
      },
      {
        items: yearsItems,
        key: 'RELEASE_YEAR',
        title: 'Release year',
        type: FilterType.MIN_MAX,
      },
      {
        items: devices,
        key: 'DEVICE',
        title: 'Device',
        type: FilterType.RADIO,
      },
      {
        items: friendInGames,
        key: 'FRIENDS_IN_GAME',
        title: 'Friends in game',
        type: FilterType.CHECKBOX,
      },
      {
        key: 'PRICE_MODEL',
        title: 'Price model',
        type: FilterType.CHECKBOX,
        items: priceModel,
      },
      {
        key: 'GAME_STATUS',
        title: 'Game status',
        type: FilterType.RADIO,
        items: gameStatuses,
      },
      {
        key: 'PLAY_AND_EARN',
        title: 'Play and Earn',
        type: FilterType.CHECKBOX,
        items: playAndEarn,
      },
    ];

    await this.cacheManager.set('filters', filters);

    return filters;
  }

  async getGamesSiteMap(chunk = 0): Promise<{ loc: string }[]> {
    const chunkLimit = 30000;
    const offset = chunkLimit * chunk;
    const games = await this.sourceRepository.find({
      select: ['code', 'update_time', 'name'],
      take: chunkLimit,
      skip: offset,
    });
    return games.map((game) => {
      const gameName = formatGameNameForSitemapFn(game.name);
      const loc = `https://gametrade.market/marketplace/${gameName}?gameCode=${game.code}`;
      return {
        loc,
        lastmod: moment(),
      };
    });
  }

  async getGameCard({ code }: GameCardParams): Promise<GameCard> {
    const source = await this.sourceRepository.findOne({
      relations: ['contracts', 'contracts.network'],
      where: {
        hidden: true,
        code,
      },
    });
    if (!source) {
      return null;
    }

    const { code: game_code, is_verify, external_link } = source;

    const currencies = await this.inventoryService.getCurrencies(game_code);

    return {
      ...source,
      code: game_code,
      admitted_to_trading: is_verify,
      external_url: external_link,
      currencies,
    };
  }

  async getContracts({ code }: ContractsListParams): Promise<ContractEntity[]> {
    return await this.contractRepository.find({ game_code: code });
  }

  async addContract({
    contract,
    source,
    blockchain,
    is_test,
  }: ContractCreateInput): Promise<Success> {
    const _contract = await this.contractRepository.findOne({
      where: { contract, game_code: source, blockchain },
    });
    if (_contract) {
      return {
        code: 'CONTACT_ALREADY_EXISTS',
        message: 'Contract already exists',
      };
    }
    await this.contractRepository.save({
      contract,
      game_code: source,
      blockchain,
      is_test,
    });
    return {
      code: 'SOURCE_ADD_CONTACT_SUCCESS',
      message: 'Contract added',
    };
  }

  async removeContract({
    contract,
    blockchain,
  }: ContractRemoveInput): Promise<Success> {
    try {
      await this.contractRepository.delete({ contract, blockchain });
      return {
        code: 'SOURCE_REMOVE_CONTACT_SUCCESS',
        message: 'Contract removed',
      };
    } catch (error) {
      if (error.code == '23503') {
        return {
          code: 'SOURCE_REMOVE_CONTACT_FAILURE',
          message: 'Contract has dependencies',
        };
      }

      return {
        code: 'SOURCE_REMOVE_CONTACT_FAILURE',
        message: error.message,
      };
    }
  }

  async addSource(params: AddSourceInput, owner_id: string): Promise<Success> {
    const {
      name,
      logo_url,
      media_links,
      release_date,
      publisher,
      social_links,
      picture_url,
      state,
      developer,
      description,
      contracts,
      external_url,
      app_links,
      is_game_required,
      is_play_to_earn_nft,
      is_play_to_earn_crypto,
      is_crypto_required,
      is_free_to_play,
      is_nft_required,
      genre_code,
      is_partner,
    } = params;
    if (contracts) {
      await Promise.all(
        contracts.map((contract) => {
          return this.addContract(contract);
        }),
      );
    }
    const source = await this.sourceRepository.save({
      code: name.toUpperCase().replace(' ', '_'),
      name,
      media_links,
      logo: logo_url,
      picture_url,
      release_date,
      description,
      app_links,
      state,
      publisher,
      social_links,
      owner_id,
      developer,
      is_game_required,
      is_play_to_earn_nft,
      is_play_to_earn_crypto,
      is_crypto_required,
      is_free_to_play,
      is_nft_required,
      is_partner,
      external_link: external_url,
    });
    if (genre_code) {
      await this.sourceGenreEntityRepository.save({
        game_code: source.code,
        genre_code,
      });
    }

    return {
      message: 'Source added',
      code: 'SOURCE_ADD_SUCCESS',
    };
  }

  async updateSource(
    params: UpdateSourceInput,
    owner_id: string,
  ): Promise<Success> {
    const {
      name,
      code,
      publisher,
      developer,
      release_date,
      social_links,
      picture_url,
      media_links,
      description,
      state,
      logo_url,
      contracts,
      external_url,
      app_links,
      is_game_required,
      is_play_to_earn_nft,
      is_play_to_earn_crypto,
      is_crypto_required,
      is_free_to_play,
      is_nft_required,
      genre_code,
      is_partner,
    } = params;
    const oldSourceData = await this.sourceRepository.findOne({
      where: { code, hidden: true },
    });

    const newSourceData = { ...oldSourceData };

    if (app_links) newSourceData.app_links = app_links;
    if (external_url) newSourceData.external_link = external_url;
    if (name) newSourceData.name = name;
    if (state) newSourceData.state = state;
    if (owner_id) newSourceData.owner_id = owner_id;
    if (description) newSourceData.description = description;
    if (logo_url) newSourceData.logo = logo_url;
    if (publisher) newSourceData.publisher = publisher;
    if (developer) newSourceData.developer = developer;
    if (social_links) newSourceData.social_links = social_links;
    if (media_links) newSourceData.media_links = media_links;
    if (release_date) newSourceData.release_date = release_date;
    if (picture_url) newSourceData.picture_url = picture_url;

    if (isBoolean(is_partner)) {
      newSourceData.is_partner = is_partner;
    }
    if (typeof is_game_required === 'boolean') {
      newSourceData.is_game_required = is_game_required;
    }
    if (typeof is_game_required === 'boolean') {
      newSourceData.is_play_to_earn_nft = is_play_to_earn_nft;
    }
    if (typeof is_play_to_earn_crypto === 'boolean') {
      newSourceData.is_play_to_earn_crypto = is_play_to_earn_crypto;
    }
    if (typeof is_free_to_play === 'boolean') {
      newSourceData.is_free_to_play = is_free_to_play;
    }
    if (typeof is_crypto_required === 'boolean') {
      newSourceData.is_crypto_required = is_crypto_required;
    }
    if (typeof is_nft_required === 'boolean') {
      newSourceData.is_nft_required = is_nft_required;
    }

    if (genre_code) {
      const sourceGenre = await this.sourceGenreEntityRepository.findOne({
        where: { game_code: code },
      });
      if (sourceGenre) {
        await this.sourceGenreEntityRepository.update(
          {
            id: sourceGenre.id,
          },
          {
            genre_code,
          },
        );
      } else {
        await this.sourceGenreEntityRepository.save({
          game_code: code,
          genre_code,
        });
      }
    }

    await this.sourceRepository.update({ code }, newSourceData);

    if (contracts) {
      await Promise.all(
        contracts.map((contract) => {
          return this.removeContract({
            contract: contract.contract,
            blockchain: contract.blockchain,
          });
        }),
      );
      await Promise.all(
        contracts.map((contract) => {
          return this.addContract(contract);
        }),
      );
    }

    return {
      message: 'Source updated',
      code: 'SOURCE_UPDATE_SUCCESS',
    };
  }

  async removeSource({ code }: RemoveSourceInput): Promise<Success> {
    await this.sourceRepository.delete({ code });
    return {
      message: 'Source deleted',
      code: 'SOURCE_DELETE_SUCCESS',
    };
  }

  async getPublisherUsers({ code }: PublisherUsersParams): Promise<any> {
    return await getManager().query(
      `
          SELECT isu.user_id, au.email
          FROM inventory.source_users AS isu
                   INNER JOIN account.users AS au
                              ON isu.user_id = au.id
          WHERE isu.code = $1
      `,
      [code],
    );
  }

  async addPublishUser({
    code,
    user_email,
  }: AddPublisherOfSourceInput): Promise<Success> {
    const user = await this.accountService.getUserByEmail(user_email);

    if (!user) {
      return {
        message: 'User with this email not exist',
        code: 'PUBLISHER_OF_SOURCE_ADD_FAIL',
      };
    }

    const sourceUser = await this.sourceUserRepository.findOne({
      where: { code, user_id: user.id },
    });

    if (sourceUser) {
      return {
        message: 'Publisher already added',
        code: 'PUBLISHER_OF_SOURCE_ALREADY_ADD_SUCCESS',
      };
    }

    await this.sourceUserRepository.insert({ code, user_id: user.id });

    return {
      message: 'Publisher added',
      code: 'PUBLISHER_OF_SOURCE_ADD_SUCCESS',
    };
  }

  async removePublishUser({
    code,
    user_id,
  }: RemovePublisherOfSourceInput): Promise<Success> {
    await this.sourceUserRepository.delete({ code, user_id });
    return {
      message: 'Publisher deleted',
      code: 'PUBLISHER_OF_SOURCE_DELETE_SUCCESS',
    };
  }

  async getContractBySourceCode(code: string): Promise<ContractEntity[]> {
    const cache = await this.cacheManager.get(`${code}:contracts`);

    if (isArray(cache)) {
      return cache;
    }

    const foundContracts = await this.contractRepository.find({
      relations: ['source'],
      where: {
        game_code: code,
      },
    });
    await this.cacheManager.set(`${code}:contracts`, foundContracts);

    return foundContracts;
  }

  async getCatalog(
    params: CatalogGameParams,
    user_id: string,
  ): Promise<CatalogGameConnection> {
    let where = 'and s.hidden is true ';

    if (params?.name) {
      where += `and s.name ilike '%${params.name}%'`;
    }

    if (params?.releaseDates) {
      const releases = params.releaseDates.join("','");
      where += `and s.release_date in ('${releases}') `;
    }

    if (params?.gameCode) {
      where += `and s.code = '${params.gameCode}'`;
    }

    if (params?.gameStatus) {
      where += `and s.state = '${SourceStateTypeEnum[params.gameStatus]}'`;
    }

    if (params?.genreCodes) {
      const genres = params.genreCodes.join("','");
      where += `and exists(select from inventory.source_genres g where g.game_code = s.code and g.genre_code in ('${genres}'))`;
    }

    if (params?.device) {
      where += `and s.app_links @> '[{"type": "${params.device}"}]'::jsonb `;
    }

    if (params?.blockchains) {
      const blockchains = params.blockchains.join("','");
      where += `and exists(select c.contract from inventory.contracts c 
      where c.game_code = s.code and c.blockchain in ('${blockchains}'))`;
    }

    if (params?.playAndEarn) {
      if (params.playAndEarn.includes('is_play_to_earn_crypto')) {
        where += `and s.is_play_to_earn_crypto is true `;
      }

      if (params.playAndEarn.includes('is_play_to_earn_nft')) {
        where += `and s.is_play_to_earn_nft is true `;
      }
    }

    if (params?.priceModels && !params?.topFree) {
      if (params.priceModels.includes('is_free_to_play')) {
        where += `and s.is_free_to_play is true `;
      }

      if (params.priceModels.includes('is_nft_required')) {
        where += `and s.is_nft_required is true `;
      }

      if (params.priceModels.includes('is_crypto_required')) {
        where += `and s.is_crypto_required is true `;
      }

      if (params.priceModels.includes('is_game_required')) {
        where += `and s.is_game_required is true `;
      }
    }

    if (params?.friendInGames && user_id) {
      // where += `and exists(select c.contract from inventory.contracts c where c.game_code = s.code and c.blockchain in ('${blockchains}'))`;
    }

    if (params?.topFree) {
      where += `and s.is_free_to_play is true `;
    }

    let orderBy = 'order by t.is_partner, t.name';
    if (params?.sort) {
      if (params.sort.price) {
        orderBy = `order by t.min_price ${params.sort.price} nulls last`;
      }
      if (params.sort.rating) {
        orderBy = `order by (select coalesce(avg(r.rating), 4) from inventory.reviews r where r.game_code = t.code) ${params.sort.rating} nulls last`;
      }
    }

    let games_count;
    if (params) {
      if (where) {
        where = 'where ' + where.slice(3);
      }
      const cache = await this.cacheManager.get(`${where}:count_games`);

      if (isArray(cache)) {
        games_count = cache;
      } else {
        games_count = await getManager().query(
          `select count(s.code)
           from inventory.sources s
               ${where}
          `,
        );

        await this.cacheManager.set(`${where}:count_games`, games_count);
      }
    }

    let games;

    if (params?.topRank || params?.topFree || params.topReview) {
      const condition = params?.topReview ? ' and r.rating in (4, 5)' : '';

      const cache = await this.cacheManager.get(`${where}:games`);

      if (isArray(cache)) {
        games = cache;
      } else {
        games = await getManager().query(`
          select s.*, (select coalesce(avg(r.rating), 4) from inventory.reviews r where r.game_code = s.code ${condition}) as rating
          from inventory.sources s 
          ${where}
          order by (select coalesce(avg(r.rating), 4) from inventory.reviews r where r.game_code = s.code) desc nulls last    
          limit ${params?.first ?? 20} offset ${params?.offset ?? 0};
      `);

        await this.cacheManager.set(`${where}:games`, games);
      }
    } else if (params?.isTrending) {
      where += 'and s.is_partner is true ';

      const cache = await this.cacheManager.get(`${where}:games_tranding`);

      if (isArray(cache)) {
        games = cache;
      } else {
        games = await getManager().query(`
          select s.*
          from inventory.sources s
          ${where}
          limit ${params?.first ?? 20} offset ${params?.offset ?? 0};
      `);

        await this.cacheManager.set(`${where}:games_tranding`, games);
      }
    } else {
      games = await getManager().query(`
          select t.* from (select s.*,
           (select min(i.price)
            from inventory.items i where i.game_code = s.code and i.price is not null) min_price
          from inventory.sources s
          ${where}
          limit ${params?.first ?? 20} offset ${params?.offset ?? 0}) as t
          ${orderBy};
      `);
    }

    return {
      totalCount: games_count[0].count,
      edges: {
        node: games.map((game) => ({
          ...game,
          release_date:
            isString(game.release_date) &&
            game.release_date.match(/\d{4}-\d{2}-\d{2}/)
              ? new Date(game.release_date).toISOString()
              : game.release_date,
        })),
      },
      pageInfo: {
        hasNextPage:
          params?.first * params?.offset + params?.first < games_count[0].count,
      },
    };
  }

  async getLandingCatalog(
    params: CatalogGameParams,
  ): Promise<CatalogGameConnection> {
    let where = 'and s.hidden is true ';

    if (params?.topFree) {
      where += `and s.is_free_to_play is true `;
    }

    let orderBy = 'order by t.is_partner, t.name';
    if (params?.sort) {
      if (params.sort.price) {
        orderBy = `order by t.min_price ${params.sort.price} nulls last`;
      }
      if (params.sort.rating) {
        orderBy = `order by (select coalesce(avg(r.rating), 4) from inventory.reviews r where r.game_code = t.code) ${params.sort.rating} nulls last`;
      }
    }

    let games_count;
    if (params) {
      if (where) {
        where = 'where ' + where.slice(3);
      }
      const cache = await this.cacheManager.get(`${where}:landing_count_games`);

      if (isArray(cache)) {
        games_count = cache;
      } else {
        games_count = await getManager().query(
          `select count(s.code)
           from inventory.sources s
               ${where}
          `,
        );

        await this.cacheManager.set(
          `${where}:landing_count_games`,
          games_count,
          86400
        );
      }
    }

    let games;

    if (params?.topRank || params?.topFree || params.topReview) {
      const condition = params?.topReview ? ' and r.rating in (4, 5)' : '';

      const cache = await this.cacheManager.get(`${where}:landing_games`);

      if (isArray(cache)) {
        games = cache;
      } else {
        games = await getManager().query(`
          select s.*, (select coalesce(avg(r.rating), 4) from inventory.reviews r where r.game_code = s.code ${condition}) as rating
          from inventory.sources s 
          ${where}
          order by (select coalesce(avg(r.rating), 4) from inventory.reviews r where r.game_code = s.code) desc nulls last    
          limit ${params?.first ?? 20} offset ${params?.offset ?? 0};
      `);

        await this.cacheManager.set(`${where}:landing_games`, games, 86400);
      }
    } else if (params?.isTrending) {
      where += 'and s.is_partner is true ';
      const cache = await this.cacheManager.get(`${where}:landing_games`);

      if (isArray(cache)) {
        games = cache;
      } else {
        games = await getManager().query(`
          select s.*
          from inventory.sources s
          ${where}
          limit ${params?.first ?? 20} offset ${params?.offset ?? 0};
      `);

        await this.cacheManager.set(`${where}:landing_games`, games, 86400);
      }
    } else {
      const cache = await this.cacheManager.get(`${where}:main_landing_games`);

      if (isArray(cache)) {
        games = cache;
      } else {
        games = await getManager().query(`
          select t.* from (select s.*,
           (select min(i.price)
            from inventory.items i where i.game_code = s.code and i.price is not null) min_price
          from inventory.sources s
          ${where}
          limit ${params?.first ?? 20} offset ${params?.offset ?? 0}) as t
          ${orderBy};
      `);
        await this.cacheManager.set(`${where}:main_landing_games`, games, 86400);
      }
    }

    return {
      totalCount: games_count[0].count,
      edges: {
        node: games.map((game) => ({
          ...game,
          release_date:
            isString(game.release_date) &&
            game.release_date.match(/\d{4}-\d{2}-\d{2}/)
              ? new Date(game.release_date).toISOString()
              : game.release_date,
        })),
      },
      pageInfo: {
        hasNextPage:
          params?.first * params?.offset + params?.first < games_count[0].count,
      },
    };
  }

  async getBlockchainNamesBySource(card: GameCard): Promise<string[]> {
    const contracts = await this.contractRepository.find({
      relations: ['network'],
      where: { game_code: card.code },
    });

    return contracts.map((contract) => contract.network.code);
  }
}
