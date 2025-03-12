import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Cache } from 'cache-manager';
import { BigQuery } from '@google-cloud/bigquery';
import { Contract } from 'web3-eth-contract';
import { ethers } from 'ethers';
import { getManager, In, MoreThan, Repository } from 'typeorm';
import { lastValueFrom, switchMap, toArray } from 'rxjs';
import { isArray, isObject, isString } from 'class-validator';
import moment from 'moment';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import Moralis from 'moralis';
import { Chain, OpenSeaSDK } from 'opensea-js';
import { Metaplex } from '@metaplex-foundation/js';
import { Connection, PublicKey } from '@solana/web3.js';

import { Blockchain } from '../blockchain/interfaces/blockchain.interface';
import { TokenInfoParams } from '../blockchain/interfaces/token.input';
import { Nullable } from '../utils/interfaces/utils.interface';
import { GameItemsParams } from '../admin/interfaces/admin.interface';
import {
  ITokenTransfer,
  TokenTransfer,
} from './interfaces/token-transfer.interface';
import { ContractService } from './contract.service';
import { InventoryEntity, SaleType } from './models/inventory.entity';
import { WalletService } from '../account/wallet/wallet.service';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Card,
  CardConnection,
  Currency,
  DisplayType,
  GameCardsParams,
  GameTokenCardParams,
  SimilarCardsParams,
} from './interfaces/card.interface';
import {
  GameTokenFilterParams,
  GetInventoryParams,
} from './interfaces/inventory.input';
import { IGetPrice } from '../blockchain/interfaces/contract.interface';
import { TokenDataAttrs, TokenInfo } from '../blockchain/dto/token-info.dto';
import { Wallet } from '../account/wallet/dto/wallet.dto';
import {
  FilterType,
  // GameCoinFilterValue,
  GameTokenFacet,
  GameTokenFacetsParams,
  GameTokenFacetTypeEnum,
} from './interfaces/market.interface';
import { ContractEntity } from './models/contract.entity';
import { NetworkEntity } from '../blockchain/models/network.entity';
import { InventoryLikeEntity } from './models/inventory-like.entity';
import { OpenseaBotService } from '../utils/opensea-bot/opensea-bot.service';
import { mapCardTokenFn } from './helpers';
import { SourceCurrencyEntity } from '../source/models/source-currency.entity';
import { GameCurrency } from '../source/dto/source-currency.dto';
import { ABI_ERC721, ABI_TRADE_TOKEN_GTM } from './constant';
import { SetCoinInfoInput } from './interfaces/set-coin-info.input';
import { SourceEntity } from '../source/models/source.entity';
import { ExchangeService } from '../exchange/exchange.service';
import { SetCoinInfo } from './interfaces/set-coin-info.interface';
import { SlideEntity } from './models/slide.entity';
import { ImmutableService } from '../immutable/immutable.service';
import { ItemUpdateLogEntity } from './models/item-update-log.entity';
import { GetTopSailTokensQuery } from './dto';
import { CoinInfoEntity } from 'src/source/models/coin-info.entity';
import { getUniqueArr } from './helpers/unique';
import { isPromise } from 'rxjs/internal/util/isPromise';

const bigQueryTable = {
  [Blockchain.ETHEREUM]: 'bigquery-public-data.ethereum_blockchain',
  [Blockchain.POLYGON]: 'public-data-frinance.crypto_polygon',
};

@Injectable()
export class InventoryService {
  private logger = new Logger(InventoryService.name);
  NULL_ADDR = '0x0000000000000000000000000000000000000000';

  private jsonRpcProvider = new ethers.providers.JsonRpcProvider();
  private QuickNodeSolana = new Connection(
    `https://muddy-solitary-putty.solana-mainnet.discover.quiknode.pro/${process.env.QUICKNODE_API_KEY}/`,
  );

  private MetaplexAddressAuctionHouse =
    process.env.METAPLEX_AUCTION_HOUSE_GAME_TRADE_MARKET;

  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly openseaBotService: OpenseaBotService,
    private readonly exchangeService: ExchangeService,
    readonly contractService: ContractService,
    private readonly walletService: WalletService,
    @InjectRepository(ContractEntity)
    private readonly contractRepository: Repository<ContractEntity>,
    @InjectRepository(SlideEntity)
    private readonly slideRepository: Repository<SlideEntity>,
    @InjectRepository(NetworkEntity)
    private readonly networkRepository: Repository<NetworkEntity>,
    private readonly httpService: HttpService,
    @InjectRepository(SourceEntity)
    private readonly sourceRepository: Repository<SourceEntity>,
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepository: Repository<InventoryEntity>,
    @InjectRepository(InventoryLikeEntity)
    private readonly inventoryLikeRepository: Repository<InventoryLikeEntity>,
    @InjectRepository(SourceCurrencyEntity)
    private readonly sourceCurrencyRepository: Repository<SourceCurrencyEntity>,
    @InjectRepository(CoinInfoEntity)
    private readonly coinInfoRepository: Repository<CoinInfoEntity>,
    private readonly immutableService: ImmutableService,
  ) {}

  async setCoinInfo(params: SetCoinInfoInput): Promise<SetCoinInfo> {
    if (!params.coin_address || typeof params.coin_price !== 'number')
      return null;

    await this.inventoryRepository.update(
      {
        contract: params.contract,
        token_value: params.tokenValue,
      },
      {
        ...(params.coin_address
          ? { coin_address: params.coin_address }
          : undefined),
        ...(params.coin_price
          ? { price: params.coin_price * 10 ** 18 }
          : undefined),
      },
    );

    return {
      coin_address: params.coin_address,
      coin_price: params.coin_price,
    };
  }

  async getNFTsByUser(address: string) {
    if (!isString(address)) {
      return false;
    }
    const networks = await this.networkRepository.find({
      where: { is_enabled: true },
    });
    const API_KEY = this.configService.get<string>('MORALIS_API_KEY');
    try {
      await Moralis.start({
        apiKey: API_KEY,
      });
    } catch (error) {
      console.log(error.message);
    }

    const response = await Promise.all(
      networks.map(async (network) => {
        let chain;
        switch (network.code) {
          case Blockchain.BINANCE:
            chain = EvmChain.BSC;
            break;
          case Blockchain.ETHEREUM:
            chain = EvmChain.ETHEREUM;
            break;
          case Blockchain.POLYGON:
            chain = EvmChain.POLYGON;
            break;
          default:
        }
        if (chain) {
          let getItems;
          try {
            getItems = await Moralis.EvmApi.nft.getWalletNFTs({
              address,
              chain,
            });
          } catch (err) {
            this.logger.error(err.message);
          }

          return (
            getItems?.jsonResponse?.result
              ?.map((asset) => {
                const metadata = JSON.parse(asset.metadata);
                if (metadata) {
                  return {
                    contract: asset.token_address,
                    token_value: asset.token_id,
                    wallet: asset.owner_of,
                    token_uri: asset.token_uri,
                    attributes: {
                      name: metadata.name,
                      description: metadata.description,
                      picture: metadata.image || metadata.picture,
                      attributes:
                        metadata.attributes?.map((trait) => ({
                          trait_type: trait.trait_type,
                          display_type: DisplayType.string,
                          value: trait.value,
                          max_value: trait.max_value,
                          trait_count: trait.trait_count,
                          order: trait.order,
                          max_count: trait.max_count,
                        })) || [],
                    },
                  };
                } else {
                  return {
                    contract: asset.token_address,
                    token_value: asset.token_id,
                    wallet: asset.owner_of,
                    token_uri: asset?.token_uri,
                    attributes: {
                      name: asset.name ?? asset.token_id,
                      description: asset.name ?? '',
                      picture: '',
                      attributes: [],
                    },
                  };
                }
              })
              ?.filter(Boolean) || []
          );
        }
        return [];
      }),
    );
    const tokens = response.reduce((acc, current) => acc.concat(current), []);

    await Promise.all(
      tokens.map(async (token) => {
        const contract = await this.contractRepository.findOne({
          contract: token.contract,
        });
        const _token = await this.inventoryRepository.findOne({
          token_value: token.token_value,
          contract: token.contract,
        });
        if (isObject(contract) && !isObject(_token)) {
          const response = await this.inventoryRepository.create({
            platform: 'GAMETRADE',
            token_value: token.token_value,
            contract: token.contract,
            blockchain: token.blockchain,
            game_code: token.game_code,
            wallet: token.wallet,
            token_uri: token.token_uri,
            attributes: token.attributes,
            sale_type: SaleType.FIXED_PRICE,
          });
          await response.save();
        } else if (isObject(contract) && isObject(_token)) {
          await this.inventoryRepository.save({
            id: _token.id,
            contract: token.contract,
            token_value: token.token_value,
            platform: 'GAMETRADE',
            wallet: token.wallet,
            token_uri: token.token_uri,
            attributes: token.attributes,
            sale_type: SaleType.FIXED_PRICE,
          });
        }
      }),
    );
    return tokens;
  }

  async getNFTsItemsByUser(
    address: string,
    blockchain: Blockchain,
  ): Promise<any[]> {
    if (!isString(address)) {
      return [];
    }
    const API_KEY = this.configService.get<string>('MORALIS_API_KEY');
    try {
      await Moralis.start({
        apiKey: API_KEY,
      });
    } catch (err) {
      this.logger.error(err.message);
    }
    let chain;
    switch (blockchain) {
      case Blockchain.BINANCE:
        chain = EvmChain.BSC;
        break;
      case Blockchain.ETHEREUM:
        chain = EvmChain.ETHEREUM;
        break;
      case Blockchain.POLYGON:
        chain = EvmChain.POLYGON;
        break;
      default:
        return [];
    }
    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      address,
      chain,
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const assets = response.getResult();

    return assets
      .map((asset) => asset._data)
      .filter((asset) => Boolean(asset.metadata))
      .map((asset) => ({
        contract: asset.tokenAddress._value,
        token_value: asset.tokenId,
        wallet: asset.ownerOf._value,
        token_uri: asset.tokenUri,
      }));
  }

  async getFacets(params: GameTokenFacetsParams): Promise<GameTokenFacet> {
    const cache = await this.cacheManager.get(`${params.gameCode}:facets`);

    if (isArray(cache)) {
      return cache;
    }

    const response = await this.inventoryRepository.query(
      `
        select distinct on ("trait_type", "value")
          prop ->> 'trait_type' as "trait_type",
          prop ->> 'value' as "value",
          count(*) as value_count
        from inventory.items t
            cross join jsonb_array_elements(
                case jsonb_typeof(t.attributes -> 'attributes') when 'array' then t.attributes -> 'attributes' else '[]' end
            ) as prop
            join inventory.contracts c on c.contract = t.contract
            join inventory.sources g on g.code = c.game_code and g.code = $1
        where (prop ->> 'trait_type') is not null
        group by 
          "trait_type", "value"
        order by 
          "trait_type", "value", value_count desc;
    `,
      [params.gameCode],
    );

    const result = {};
    response.forEach((facet) => {
      if (!result[facet.trait_type]) {
        result[facet.trait_type] = {
          trait_type: facet.trait_type,
          values: [],
        };
      }

      if (facet.value) {
        result[facet.trait_type].values.push({
          value: Number(facet.value) ? parseInt(facet.value) : facet.value,
          value_count: facet.value_count ?? 0,
        });
      }
    });

    const resultItems = Object.values(result);

    const items = resultItems.map((facet: any) => {
      const type =
        typeof facet?.values[0]?.value === 'number' ? 'LEVEL' : 'PROP';
      const key =
        typeof facet?.values[0]?.value === 'number'
          ? `${facet.trait_type}`
          : facet.trait_type;

      return {
        key,
        type,
        min:
          type === 'LEVEL'
            ? Math.min(
                ...facet.values.map((value) => parseInt(value.value_count)),
              )
            : null,
        max:
          type === 'LEVEL'
            ? Math.max(
                ...facet.values.map((value) => parseInt(value.value_count)),
              )
            : null,
        values:
          type === 'PROP'
            ? facet.values.map((value) => ({
                key: value.value,
                count: parseInt(value.value_count),
              }))
            : [],
      };
    });

    await this.cacheManager.set(`${params.gameCode}:facets`, items);

    return items;
  }

  async getCurrencies(game_code: string): Promise<GameCurrency[]> {
    if (!isString(game_code)) {
      return [];
    }
    const contractCurrencies = await this.contractRepository.find({
      relations: ['network'],
      where: { game_code },
    });
    if (!isArray(contractCurrencies) && contractCurrencies.length === 0) {
      return [];
    }

    const cryptoCurrencies = contractCurrencies
      .filter(
        (value, index, self) =>
          self.findIndex(
            (v) => v.network.currency === value.network.currency,
          ) === index,
      )
      .map((contract: any) => ({
        id: null,
        coin_name: contract.network.currency,
        blockchain_code: contract.blockchain,
        contract_address: '0x0000000000000000000000000000000000000000',
        decimals: null,
        game_code,
        logo: null,
        created_at: null,
        price: null,
        gecko_id: null,
        hidden: false,
      }));

    const currencies = await this.sourceCurrencyRepository.find({
      relations: ['coin', 'coin.network'],
      where: {
        game_code,
        coin: {
          network: {
            is_enabled: true,
          },
        },
      },
    });

    const response = await Promise.all(
      [...currencies, ...cryptoCurrencies].map(
        async (currency: SourceCurrencyEntity) => {
          let price = null;
          if (currency.coin?.external_id) {
            const sourceCurrency = await this.sourceCurrencyRepository.findOne({
              relations: ['coin'],
              where: {
                coin: {
                  external_id: currency.coin.external_id,
                },
              },
            });
            price = sourceCurrency?.coin.price ?? 0;
          }
          let cryptoPrice = null;
          if (!currency.id && currency.coin) {
            cryptoPrice = await this.getExchangeRatesByCurrency(
              currency.coin.symbol as Currency,
            );
          }

          if (!currency.coin) {
            return null;
          }

          return {
            id: currency.id,
            coin_name: currency.coin.name,
            logo: currency.coin.thumbnail_url,
            blockchain_code: currency.coin.blockchain,
            decimals: currency.coin.decimals,
            contract_address: currency.coin.contract,
            crypto_currency:
              !currency.id && currency.coin ? currency.coin.symbol : null,
            price,
            crypto_price: cryptoPrice,
          };
        },
      ),
    );

    return response.filter(Boolean);
  }

  async addInventoryItem(
    user_id: string,
    contract: string,
    token: string,
    game_code: string,
  ) {
    const item = await this.searchTokenMetaData(contract, token);
    if (!item) {
      throw new BadRequestException({
        message: 'Item is not found',
        code: 'ITEM_IS_NOT_FOUND',
      });
    }
    if (!item.owner) {
      throw new BadRequestException({
        message: 'Item is null',
        code: 'ITEM_OWNER_IS_NULL',
      });
    }
    const wallet = await this.walletService.getWalletByUserIdAndAddress(
      user_id,
      item.owner,
    );
    if (!wallet) {
      throw new BadRequestException({
        message: 'You is not owner of the token',
        code: 'INVALID_OWNER',
      });
    }

    const contract_info = await this.contractRepository.findOne({
      relations: ['network'],
      where: { contract: item.contract },
    });

    const inv = await this.inventoryRepository
      .create({
        wallet: wallet.address,
        contract: item.contract,
        blockchain: contract_info.network.code,
        token_value: item.token_value,
        game_code,
        token_uri: item.token_uri,
        picture: item.picture,
        attributes: item.attributes,
        sale_type: SaleType.FIXED_PRICE, // FIXME clarify how this parameter is determined
        price: item.price,
        fee: item.fee,
      })
      .save();

    return {
      ...inv,
      blockchain: item.blockchain,
    };
  }

  getTokenInfo({ token_value, contract }: TokenInfoParams): Promise<TokenInfo> {
    return this.searchTokenMetaData(contract, token_value);
  }

  async removeItemFromInventory(
    user_id: string,
    contract: string,
    token_value: string,
  ) {
    const wallets = await this.walletService.myWallets(user_id);
    await getManager().transaction(async (t) => {
      await Promise.all(
        wallets.map(({ id }) =>
          t.delete(InventoryEntity, { token_value, contract, wallet_id: id }),
        ),
      );
    });
    return {
      message: 'Item is deleted',
      code: 'REMOVE_INVENTORY_SUCCESS',
    };
  }

  async getTokenInfoFromGameTrade(blockchain, contract, token) {
    const smartContractInfo =
      await this.contractService.blockchainService.getByCode(blockchain);

    if (!smartContractInfo) return null;
    const wbTradeContract: any = new smartContractInfo.wb.eth.Contract(
      ABI_TRADE_TOKEN_GTM,
      smartContractInfo.trade_contract,
    );

    return await this.getPrice(wbTradeContract, contract, token);
  }

  async refresh(inventoryItem) {
    const asset = await this.getTokenMetaData(
      inventoryItem.wallet,
      inventoryItem.token_value,
      inventoryItem.blockchain,
    );
    if (!asset) return inventoryItem;

    let isApproved,
      price,
      _attrs = [],
      platform = 'SEAPORT', // 'OPENSEA'
      trade_contract = '0x436CEb97d2d79DDaa67d0F9045108A9BaC8b26d9';

    if (asset.isGameTrade) {
      platform = 'GAMETRADE';
      trade_contract = asset.trade_contract;
    }

    if (Array.isArray(asset.attributes?.attributes)) {
      _attrs = asset.attributes?.attributes;
    }

    const attrs = _attrs.map((trait) => ({
      trait_type: trait.trait_type,
      display_type: DisplayType.string,
      value: trait.value,
      max_value: trait.max_value,
      trait_count: trait.trait_count,
      order: trait.order,
      max_count: trait.max_count,
    }));

    if (typeof asset.approved === 'boolean') {
      isApproved = asset.approved;
    } else {
      asset.approved = inventoryItem.approved;
    }

    if (!inventoryItem && asset) {
      const contract = await this.contractRepository.findOne({
        relations: ['network'],
        where: { contract: inventoryItem.contract },
      });

      const response = await this.inventoryRepository.create({
        token_value: inventoryItem.token_value,
        contract: inventoryItem.contract,
        blockchain: contract.network.code,
        wallet: asset.owner,
        token_uri: asset.token_uri ?? '',
        trade_contract,
        price: Boolean(+asset.price) ? +asset.price : null,
        fee: asset.fee,
        attributes: {
          name: asset.attributes?.name,
          description: asset.attributes?.description,
          picture: asset.attributes?.picture,
          attributes: attrs,
        },
        sale_type: SaleType.FIXED_PRICE,
        approved: isApproved,
        platform,
      });
      await response.save();
    }

    if (
      inventoryItem &&
      inventoryItem.coin_address !==
        '0x0000000000000000000000000000000000000000'
    ) {
      price = inventoryItem.price;
    } else {
      price = +asset.price ? asset.price : inventoryItem?.price;
    }

    if (
      !isApproved &&
      (asset.owner || '').toLowerCase() !==
        (inventoryItem?.wallet || '').toLowerCase() &&
      inventoryItem?.id
    ) {
      price = null;
      await this.inventoryRepository.update(
        {
          id: inventoryItem.id,
        },
        {
          coin_address: '0x0000000000000000000000000000000000000000',
          coin_price: null,
          price,
        },
      );
    }

    return {
      contract: asset.contract,
      token_value: asset.token_value,
      approved: isApproved,
      wallet: asset.owner,
      trade_contract,
      price: price === 0 ? null : price,
      fee: asset.fee ? asset.fee : inventoryItem?.fee,
      token_uri: asset.token_uri,
      platform,
      attributes: {
        name: asset.attributes?.name || inventoryItem?.attributes?.name,
        description: asset.attributes?.description
          ? asset.attributes?.description
          : inventoryItem?.attributes?.description,
        picture: inventoryItem.attributes?.picture
          ? inventoryItem.attributes?.picture
          : asset.attributes?.picture,
        attributes: _attrs.map((trait) => ({
          trait_type: trait.trait_type,
          display_type: DisplayType.string,
          value: trait.value,
          max_value: trait.max_value,
          trait_count: trait.trait_count,
          order: trait.order,
          max_count: trait.max_count,
        })),
      },
    };
  }

  async getSolanaATA(token_value, owner) {
    const accountPublicKey = new PublicKey(owner);

    const mintAccount = new PublicKey(token_value);
    const account = await this.QuickNodeSolana.getTokenAccountsByOwner(
      accountPublicKey,
      {
        mint: mintAccount,
      },
    );

    if (account?.value[0]?.pubkey) {
      return account.value[0].pubkey.toString();
    } else {
      return '';
    }
  }

  async refreshInventoryItem(
    contract: string,
    token_value: string,
    blockchain: Blockchain,
  ): Promise<Nullable<InventoryEntity>> {
    let updateItem;
    const contractById = await this.contractService.getContractById(contract);
    const inventoryItem = await this.inventoryRepository.findOne({
      where: {
        contract,
        token_value,
      },
    });
    const platform =
      inventoryItem?.platform || contractById?.platform || 'SEAPORT'; // 'OPENSEA'

    switch (platform) {
      case 'IMX':
        try {
          updateItem = await lastValueFrom(
            this.immutableService.getNft(contract, token_value),
          );

          if (updateItem && !inventoryItem) {
            const response = await this.inventoryRepository.create({
              token_value: updateItem.token_value,
              contract: updateItem.contract,
              blockchain: updateItem.blockchain,
              game_code: updateItem.game_code,
              wallet: updateItem.wallet,
              token_uri: updateItem.token_uri,
              attributes: {
                name: updateItem.attributes?.name,
                description: updateItem.attributes?.description,
                picture: updateItem.attributes?.picture,
                attributes: updateItem.attributes?.attributes,
              },
              sale_type: SaleType.FIXED_PRICE,
              approved: updateItem.approved,
              platform,
            });
            await response.save();
          }
          this.logger.debug('added success');
        } catch (err) {
          this.logger.debug(err.message);
        }
        break;
      case 'SOLANA':
        try {
          const listings = await lastValueFrom(
            this.httpService.get(
              `https://api-mainnet.magiceden.dev/v2/tokens/${token_value}/listings`,
            ),
          );

          const responseOwner = await lastValueFrom(
            this.httpService.get(
              `https://api-mainnet.magiceden.dev/v2/tokens/${token_value}`,
            ),
          );

          let wallet = responseOwner?.data?.owner;
          let approved = false;
          let coin_address = null;
          let price = 0;
          let history_price;
          const itemId = await this.getSolanaATA(token_value, wallet);
          let item_data = {
            item_id: itemId,
            prices: 0,
          };

          if (listings?.data[0] && inventoryItem) {
            wallet = listings?.data[0]?.seller;

            price = Number(listings?.data[0]?.price)
              ? Number(listings?.data[0]?.price)
              : 0;
            approved = !!price;
            coin_address = null;

            const historyPriceResponse = await lastValueFrom(
              this.httpService.get(
                `https://api-mainnet.magiceden.dev/v2/tokens/${token_value}/activities`,
              ),
            );

            if (historyPriceResponse?.data) {
              history_price = historyPriceResponse?.data.map(
                (item) => item.price,
              );
            }
            item_data = {
              prices: historyPriceResponse?.data,
              item_id: itemId,
            };
          }
          if (inventoryItem) {
            const GTMPrice = await this.getSolanaGTMPrice({
              owner: responseOwner?.data?.owner,
              token_value,
            });
            if (GTMPrice) {
              price = Number(GTMPrice) / 10 ** 9;
            }
          }

          updateItem = {
            ...inventoryItem,
            wallet,
            price,
            approved,
            coin_address,
            history_price,
            item_data,
          };
          this.logger.debug('added success');
        } catch (err) {
          this.logger.debug(err.message);
        }
        break;
      default:
        updateItem = await this.getTokenInfoFromOpenseaSDK(
          blockchain,
          contract,
          token_value,
          inventoryItem?.trade_contract,
        );
    }

    if (!updateItem) return null;

    if (!updateItem.wallet) {
      await this.inventoryRepository.delete({
        token_value,
        contract,
      });
      return null;
    }

    return await getManager().transaction(async (manager) => {
      const upsertToken = await manager
        .upsert(
          InventoryEntity,
          {
            token_value,
            contract,
            blockchain,
            price:
              Boolean(updateItem?.price) && platform !== 'GAMETRADE'
                ? Math.trunc(updateItem.price * 10 ** 18)
                : updateItem.price,
            fee: updateItem.fee,
            wallet: updateItem?.wallet || inventoryItem?.wallet,
            token_uri: updateItem?.token_uri || inventoryItem?.token_uri,
            approved: updateItem?.approved,
            sale_type: SaleType.FIXED_PRICE,
            trade_contract:
              updateItem?.trade_contract || inventoryItem?.trade_contract,
            attributes: {
              name:
                updateItem?.attributes?.name || inventoryItem?.attributes?.name,
              picture:
                updateItem?.attributes?.picture ||
                inventoryItem?.attributes?.picture,
              description:
                updateItem?.attributes?.description ||
                inventoryItem?.attributes?.description,
              attributes:
                updateItem?.attributes?.attributes ||
                inventoryItem?.attributes?.attributes,
              history_price: updateItem?.history_price || null,
              animation_url: updateItem?.attributes?.animation_url || null,
            },
            platform: updateItem?.platform || inventoryItem?.platform,
            coin_address:
              updateItem?.coin_address || inventoryItem?.coin_address,
            imxOrderId: updateItem?.imxOrderId || inventoryItem?.imxOrderId,
            item_data: {
              prices: updateItem?.item_data?.prices ?? null,
              item_id: updateItem?.item_data?.item_id ?? null,
            },
          },
          {
            conflictPaths: ['token_value', 'contract'],
          },
        )
        .then((res) => res.raw[0]);

      const timeDifference =
        new Date().getTime() - new Date(upsertToken?.create_time).getTime();

      await manager
        .create(ItemUpdateLogEntity, {
          item_id: upsertToken.id,
          action: timeDifference > 5 * 60 * 1000 ? 'UPD' : 'ADD',
          game_code: contractById.game_code,
          created_at: new Date(),
          token_value,
          contract,
          price: updateItem.price,
        })
        .save();

      return {
        ...updateItem,
        blockchain,
        contractData: {
          game_code: contractById.game_code,
        },
      };
    });
  }

  private async getSolanaGTMPrice({ owner, token_value }) {
    const metaplex = Metaplex.make(this.QuickNodeSolana);

    const auctionHouse = await metaplex.auctionHouse().findByAddress({
      address: new PublicKey(this.MetaplexAddressAuctionHouse),
    });

    const listings = await metaplex.auctionHouse().findListings({
      auctionHouse,
      seller: new PublicKey(owner as string),
      mint: new PublicKey(token_value as string),
    });

    const purchases = await metaplex
      .auctionHouse()
      .findPurchases({ auctionHouse });

    const purchasesCreated = purchases.map((p) => p.createdAt.toNumber());
    const listingsCreated = listings.map((l) => l.createdAt.toNumber());
    if (Math.max(...purchasesCreated) > Math.max(...listingsCreated)) return 0;

    let currentListing: any = { createdAt: -Infinity };

    for (const lg of listings) {
      const listing = await metaplex.auctionHouse().findListingByReceipt({
        auctionHouse,
        receiptAddress: new PublicKey(lg.receiptAddress?.toBase58() as string),
      });
      if (
        listing.asset.address.toString() === token_value.toString() &&
        listing.createdAt.toNumber() > currentListing.createdAt
      ) {
        currentListing = listing;
      }
    }

    return currentListing?.price?.basisPoints?.toNumber();
  }

  private getOpenseaSDK(blockchain) {
    const chain = this.getOpenseaChain(blockchain);
    return new OpenSeaSDK(this.jsonRpcProvider, {
      chain,
      apiKey: process.env.OPENSEA_SDK_API_KEY,
    });
  }

  private getOpenseaChain(blockchain: string) {
    switch (blockchain) {
      case 'polygon':
        return Chain.Polygon;
      case 'ethereum_mainnet':
        return Chain.Mainnet;
      case 'binance':
        return Chain.BNB;
      default:
        return Chain.Mainnet;
    }
  }
  private async getTokenInfoFromOpenseaSDK(
    blockchain,
    tokenAddress,
    tokenID,
    trade_contract,
  ) {
    const openseaSDK = this.getOpenseaSDK(blockchain);
    let _owner,
      _price,
      _coin_address,
      _order,
      _item,
      _tokenInfoFromGameTrade,
      _fee = null,
      _approved = false,
      _platform = 'SEAPORT',
      _trade_contract = '';

    try {
      _tokenInfoFromGameTrade = await this.getTokenInfoFromGameTrade(
        blockchain,
        tokenAddress,
        tokenID,
      );
    } catch (err) {
      this.logger.warn(`GameTradeMarket Smart Contract ${err.message}`, err);
    }

    try {
      const { nft } = await openseaSDK?.api?.getNFT(
        openseaSDK.chain,
        tokenAddress,
        tokenID,
      );
      _item = nft;
    } catch (err) {
      this.logger.error(`opensea SDK GET NFT ${err.message}`, err);
    }

    try {
      _order = await openseaSDK?.api?.getOrder({
        assetContractAddress: tokenAddress,
        tokenId: tokenID,
        side: 'ask',
      });
    } catch (err) {
      this.logger.warn(`opensea SDK ORDER ${err.message}`, err);
    }

    if (_order) {
      if (_order?.maker?.address && _order?.maker?.address !== this.NULL_ADDR) {
        _owner = _order?.maker?.address;
      }

      if (_order?.currentPrice?.toString()) {
        _price = Number(_order?.currentPrice?.toString()) / 10 ** 18;
      }

      if (_order?.makerAssetBundle?.assetContract?.address) {
        _coin_address = _order?.makerAssetBundle?.assetContract?.address;
      } else if (_order?.protocolData?.parameters?.consideration.length > 0) {
        _coin_address =
          _order?.protocolData?.parameters?.consideration[0]?.token?.toLowerCase();
      } else {
        _coin_address = this.NULL_ADDR;
      }
    } else {
      _price = 0;
      _owner = _item?.owners[0] ? _item?.owners[0].address : '';
      _coin_address = this.NULL_ADDR;
    }

    if (
      _tokenInfoFromGameTrade &&
      _tokenInfoFromGameTrade?.price &&
      _tokenInfoFromGameTrade?.seller &&
      _owner &&
      _tokenInfoFromGameTrade?.seller?.toLowerCase() ===
        _owner?.toLowerCase() &&
      trade_contract
    ) {
      _price = _tokenInfoFromGameTrade?.price;
      _owner = _tokenInfoFromGameTrade?.seller;
      _fee = _tokenInfoFromGameTrade?.fee;
      _approved = !!_tokenInfoFromGameTrade?.price;
      _trade_contract = '0x436CEb97d2d79DDaa67d0F9045108A9BaC8b26d9';
      _platform = 'GAMETRADE';
    }

    return {
      price: _price,
      wallet: _owner,
      platform: _platform,
      fee: _fee,
      trade_contract: _trade_contract,
      approved: _approved,
      coin_address: _coin_address,
      // opensea SDK data
      token_uri: _item?.metadata_url ?? '',
      attributes: {
        name: _item?.name
          ? _item?.name
          : _item?.identifier && _item?.collection
          ? _item?.identifier + ' ' + _item?.collection
          : '',
        picture: _item?.image_url ?? '',
        description: _item?.description ?? '',
        attributes: _item?.traits ?? [],
      },
      // opensea SDK data
    };
  }

  private static async queryFromBigData<T>(
    sqlTxt: string,
    params: Record<any, any>,
  ): Promise<T[]> {
    const bigqueryClient = new BigQuery();
    const [rows] = await bigqueryClient.query({
      query: sqlTxt,
      params,
      // TODO move to environment variables
      location: 'US',
    });
    return rows;
  }

  private async getCoinAddressSymbolFromOpensea(
    blockchain,
    tokenAddress,
    tokenID,
  ) {
    try {
      const openseaSDK = this.getOpenseaSDK(blockchain);
      const collectionSlug = await lastValueFrom(
        this.httpService.get(
          `https://api.opensea.io/api/v2/chain/${openseaSDK.chain}/contract/${tokenAddress}`,
          {
            headers: {
              accept: 'application/json',
              'x-api-key': process.env.OPENSEA_SDK_API_KEY,
            },
          },
        ),
      );
      const slug = collectionSlug?.data?.collection;
      const coinInfoOrder = await lastValueFrom(
        this.httpService.get(
          `https://api.opensea.io/api/v2/listings/collection/${slug}/nfts/${tokenID}/best`,
          {
            headers: {
              accept: 'application/json',
              'x-api-key': process.env.OPENSEA_SDK_API_KEY,
            },
          },
        ),
      );
      if (coinInfoOrder?.data?.price?.current?.currency === 'ETH') {
        return 'matic-eth';
      }
    } catch (err) {
      this.logger.error(`opensea SDK GET COIN INFO ${err.message}`, err);
    }
  }

  async getOwnerOf(wb: Contract, token: string): Promise<Nullable<string>> {
    try {
      const owner = await wb.methods['ownerOf'](token).call();
      return owner && typeof owner == 'string' ? owner : null;
    } catch {
      // TODO figure out the causes of the error
      return null;
    }
  }

  async getURI(wb: Contract, token: string): Promise<Nullable<string>> {
    try {
      return await wb.methods['tokenURI'](token).call();
    } catch {
      return null;
    }
  }

  async isItemApproved(wb: Contract, token: string): Promise<string> {
    try {
      return await wb.methods['getApproved'](token).call();
    } catch (err) {
      return this.NULL_ADDR;
    }
  }

  async getPrice(
    wb: Contract,
    contract: string,
    token: string,
  ): Promise<Nullable<IGetPrice>> {
    try {
      const price_data = await wb.methods['getPrice'](contract, token).call();
      const seller = price_data[2] == this.NULL_ADDR ? null : price_data[2];
      const price = price_data[0] === 0 ? null : price_data[0];
      const fee = price_data[1] === 0 ? 0 : price_data[1];
      return {
        price,
        fee,
        seller,
      };
    } catch {
      return null;
    }
  }

  async getTokenUri(token_uri: string): Promise<Nullable<TokenDataAttrs>> {
    if (!token_uri) return null;
    const response = await lastValueFrom(
      this.httpService.get<TokenDataAttrs>(token_uri),
    );
    if (response.status == 200) {
      return response.data;
    } else {
      return null;
    }
  }

  async getTokenMetaData(
    contract: string,
    token: string,
    blockchain: Blockchain,
  ): Promise<TokenInfo> {
    const bc = await this.contractService.blockchainService.getByCode(
      blockchain,
    );
    if (!bc) return null;
    const wbContract = new bc.wb.eth.Contract(ABI_ERC721, contract);
    const owner = await this.getOwnerOf(wbContract as any, token);
    if (!owner) return null;
    let token_uri = await this.getURI(wbContract as any, token);
    if (token_uri.indexOf('ipfs') !== -1) {
      token_uri = token_uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    const tokenData = await this.getTokenUri(token_uri);
    const wbTradeContract: any = new bc.wb.eth.Contract(
      ABI_TRADE_TOKEN_GTM,
      bc.trade_contract,
    );
    const [map_item, approved, priceData] = await Promise.all([
      this.contractService.formatter(contract, token, tokenData),
      this.isItemApproved(wbContract as any, token),
      this.getPrice(wbTradeContract, contract, token),
    ]);
    return {
      token_value: token,
      contract,
      blockchain,
      token_uri,
      owner,
      game_code: map_item.game_code,
      attributes: map_item.attributes,
      picture: map_item.attributes.picture,
      trade_contract: bc.trade_contract,
      approved: approved === bc.trade_contract,
      name: map_item.attributes.name,
      price: priceData?.price,
      fee: priceData && priceData.seller === owner ? priceData.fee : null,
      isGameTrade: approved === bc.trade_contract,
    };
  }

  async getTokens(
    address: string,
    blockchain: Blockchain,
  ): Promise<TokenTransfer[]> {
    const ds = bigQueryTable[blockchain];
    if (!ds) return [];
    const table = `${ds}.token_transfers`;
    // TODO why is the limit 100?
    const rows = await InventoryService.queryFromBigData<ITokenTransfer>(
      `
          select value, token_address, from_address, to_address as address, block_timestamp, block_number
          from (select value,
                       token_address,
                       from_address,
                       to_address,
                       block_timestamp,
                       block_number,
                       log_index,
                       row_number() over (partition by value order by block_timestamp desc) rn
                from ${table}
                where from_address = @address
                   or to_address = @address
                order by value, block_timestamp desc)
          where rn = 1
            and to_address = @address
          limit 100;
      `,
      { address },
    );
    const response: Nullable<TokenTransfer[]> = await Promise.all(
      rows.map(
        async ({
          value,
          block_number,
          block_timestamp,
          from_address,
          token_address,
        }) => {
          const { owner, token_uri } = await this.getTokenMetaData(
            token_address,
            value,
            blockchain,
          );
          if (owner === token_address) {
            return {
              address,
              block_number,
              block_timestamp,
              blockchain,
              from_address,
              token_address,
              token_uri,
              value,
            };
          } else {
            return null;
          }
        },
      ),
    );
    return response.filter(Boolean);
  }

  async search(addresses: string[]): Promise<TokenTransfer[]> {
    const result = [];
    const networks = await this.contractService.blockchainService.getNetworks();
    for (const { code } of networks) {
      for (const address in addresses) {
        result.push(...(await this.getTokens(address, code)));
      }
    }
    return result;
  }

  private async searchTokenMetaData(
    contract: string,
    token: string,
  ): Promise<Nullable<TokenInfo>> {
    // TODO what to do when there are multiple currencies
    const networks = await this.contractService.blockchainService.getNetworks();
    for (const { code } of networks) {
      const res = await this.getTokenMetaData(contract, token, code);
      if (!res?.owner) continue;
      return res;
    }
    return null;
  }

  async getTokenCards(params: GameCardsParams): Promise<CardConnection> {
    const cacheKey = `token-cards-${JSON.stringify(params)}`;

    const cachedResult = await this.cacheManager.get<CardConnection>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const {
      facets,
      sort: order,
      first: take,
      offset: skip,
      gameCode,
      blockchains,
      contract,
      tokenValue,
      name,
      id,
      price,
      saleTypes,
      platform,
      coinAddress,
      blockchain,
    } = params;
    const conditions = [];
    let priceMin, priceMax;
    if (id) {
      conditions.push('i.id = :id');
    }
    if (gameCode) {
      conditions.push('c.game_code = :gameCode');
    }
    if (contract) {
      conditions.push('i.contract = :contract');
    }
    if (Array.isArray(blockchains)) {
      conditions.push(`i.blockchain in ('${blockchains.join("','")}')`);
    }
    if (tokenValue) {
      conditions.push('i.token_value = :tokenValue');
    }
    if (name) {
      conditions.push("i.attributes ->> 'name' ilike :name");
    }
    if (platform) {
      conditions.push('i.platform = :platform');
    }
    if (coinAddress) {
      conditions.push(
        `i.coin_address in ('${coinAddress.join(
          "','",
        )}') AND i.blockchain in ('${blockchain.join("','")}')`,
      );
    }
    if (isArray(saleTypes)) {
      saleTypes.map((saleType) => {
        switch (saleType) {
          case SaleType.FIXED_PRICE:
            conditions.push('i.price > 0 and i.coin_address is null');
            break;
          case SaleType.NOT_FOR_SALE:
            conditions.push(
              '((i.price is null or i.price = 0) and i.coin_address is null)',
            );
            break;
          default:
        }
      });
    }
    if (
      isObject(price) &&
      (!isArray(saleTypes) || !saleTypes.includes(SaleType.NOT_FOR_SALE))
    ) {
      const blockchains = await this.contractRepository.find({
        where: {
          game_code: gameCode,
        },
      });
      const uniqueBlockchains = getUniqueArr(blockchains, 'blockchain');
      const currencies = uniqueBlockchains.map((elem: any) => elem.blockchain);

      const blockchainDataPromises = currencies.map(async (currency) => {
        const blockchain = await this.coinInfoRepository.findOne({
          where: {
            blockchain: currency,
          },
        });

        if (blockchain && blockchain.price) {
          return blockchain.price;
        }

        return 0;
      });
      const blockchainData = await Promise.all(blockchainDataPromises);

      for (let i = 0; i < currencies.length; i++) {
        const blockchainPrice = blockchainData[i];

        if (!blockchainPrice) {
          return null;
        } else {
          priceMin = price?.min / blockchainPrice;
          priceMax = price?.max / blockchainPrice;
        }
      }

      if (typeof price.min === 'number') {
        conditions.push('i.price >= :curMinAmount');
      }
      if (typeof price.max === 'number') {
        conditions.push('i.price <= :curMaxAmount');
      }
    }

    if (Array.isArray(facets)) {
      const props = facets.filter(
        (facet) => facet.type === GameTokenFacetTypeEnum.PROP,
      );
      props.map((prop) => {
        const conditionProps = prop.values
          .map((value) => `$.value == "${value.key}"`)
          .join(' || ');
        conditions.push(`jsonb_path_exists(attributes -> 'attributes', 
            '$ ? ($.trait_type == "${prop.key}" && (${conditionProps}))')`);
      });

      const levels = facets.filter(
        (facet) => facet.type === GameTokenFacetTypeEnum.LEVEL,
      );
      levels.map((level) => {
        conditions.push(`jsonb_path_exists(attributes -> 'attributes', 
            '$ ? ($.trait_type == "${level.key}" && ($.value >= ${level.min} 
            && $.value <= ${level.max}))')`);
      });
    }

    const [items, totalCount] = await this.inventoryRepository
      .createQueryBuilder('i')
      .innerJoinAndSelect('i.contractData', 'c')
      .innerJoinAndSelect('c.source', 's')
      .innerJoinAndSelect('c.network', 'n')
      .where(conditions.join(' and '), {
        gameCode,
        contract,
        tokenValue,
        id,
        platform,
        name: `%${name}%`,
        curMinAmount: priceMin ? priceMin * 1e18 : 0,
        curMaxAmount: priceMax ? priceMax * 1e18 : 0,
        coinAddress,
      })
      .orderBy(
        `CASE WHEN i.price IS NULL OR i.price = 0 THEN 1 ELSE 0 END`,
        'ASC',
      )
      .addOrderBy(
        'i.price',
        order?.price === 'ASC' || order?.price === 'DESC'
          ? order?.price
          : 'DESC',
      )
      .offset(skip)
      .limit(take)
      .getManyAndCount();

    let node = [];

    const coinCache = {};
    node = items.map(async (item) => {
      const blockchain = item.blockchain
        ? item.blockchain
        : item.contractData.blockchain;
      const coinAddress =
        item.coin_address ?? '0x0000000000000000000000000000000000000000';
      const key = `${coinAddress}/${blockchain}`;
      if (!coinCache[key]) {
        const existCoin = await this.exchangeService.getCoinInfoByContractId(
          coinAddress,
          blockchain,
        );
        if (existCoin) {
          coinCache[key] = existCoin;
        } else {
          coinCache[key] = await this.exchangeService.saveCoinInfoByContractId(
            coinAddress,
            blockchain,
          );
        }
      }

      return mapCardTokenFn(item, coinCache[key]);
    });

    await this.cacheManager.set(cacheKey, {
      totalCount,
      edges: {
        node,
      },
      pageInfo: {
        hasNextPage: skip + take < totalCount,
      },
    });

    return {
      totalCount,
      edges: {
        node,
      },
      pageInfo: {
        hasNextPage: skip + take < totalCount,
      },
    };
  }

  async getTokenCard(params: GameTokenCardParams): Promise<Card> {
    const { contract, tokenValue, blockchain, id } = params;
    if (!contract && !tokenValue && !blockchain && !id) return null;
    const gameCodeItem = await this.inventoryRepository.findOne({
      where: {
        ...(contract ? { contract } : {}),
        ...(tokenValue ? { token_value: tokenValue } : {}),
      },
    });
    let item = await this.inventoryRepository.findOne({
      relations: [
        'contractData',
        'contractData.source',
        'contractData.network',
      ],
      where: {
        ...(contract ? { contract } : {}),
        ...(tokenValue ? { token_value: tokenValue } : {}),
        ...(id ? { id } : {}),
        ...(gameCodeItem ? { game_code: gameCodeItem.game_code } : {}),
      },
    });

    if (!isObject(item)) {
      item = await this.refreshInventoryItem(contract, tokenValue, blockchain);
      item = await this.inventoryRepository.findOne({
        relations: [
          'contractData',
          'contractData.source',
          'contractData.network',
        ],
        where: {
          ...(contract ? { contract } : {}),
          ...(tokenValue ? { token_value: tokenValue } : {}),
          ...(id ? { id } : {}),
          ...(gameCodeItem ? { game_code: gameCodeItem.game_code } : {}),
        },
      });
    }
    if (!isObject(item)) return null;

    const coinAddress =
      item.coin_address ?? '0x0000000000000000000000000000000000000000';

    let coin = await this.coinInfoRepository.findOne({
      where: {
        contract: coinAddress,
        blockchain: item.blockchain ?? blockchain,
      },
    });

    if (!coin) {
      coin = await this.exchangeService.saveCoinInfoByContractId(
        item.coin_address,
        item.blockchain ?? blockchain,
      );
    }

    const response = mapCardTokenFn(item, coin);
    return response;
  }

  async getSlides(): Promise<SlideEntity[]> {
    return this.slideRepository.find();
  }

  async getSimilarTokenCards(
    params: SimilarCardsParams,
  ): Promise<CardConnection> {
    const { id, first, offset } = params;
    const token = await this.inventoryRepository.findOne(id, {
      relations: ['contractData'],
    });
    if (!token) {
      return null;
    }
    const tokens = await this.getTokenCards({
      gameCode: token.contractData.game_code,
      first,
      offset,
    });

    const isExist = tokens.edges.node.find((token) => token.id === +id);

    if (isExist) {
      return {
        totalCount: tokens.totalCount - 1,
        edges: {
          node: tokens.edges.node.filter((token) => token.id !== +id),
        },
        pageInfo: tokens.pageInfo,
      };
    } else {
      return tokens;
    }
  }

  async getInventorOfUser(params: GetInventoryParams): Promise<CardConnection> {
    const wallets = await this.walletService.myWallets(
      params.userId,
      params.customUrl,
    );
    if (!wallets.length) {
      return {
        totalCount: 0,
        edges: { node: [] },
        pageInfo: {
          hasNextPage: false,
        },
      };
    }
    const addresses = wallets.map((w) => w.address.toLowerCase());

    let nftItems = [],
      cach;
    await Promise.all(
      addresses.map(async (address) => {
        cach = await this.cacheManager.get(`${address}`);
        if (!cach) {
          const addressNfts = await this.getNFTsByUser(address);
          const userNfts = this.immutableService
            .getUserNfts(address)
            .pipe(
              switchMap((userNftsArray) => userNftsArray),
              toArray(),
            )
            .toPromise();
          nftItems = nftItems.concat(userNfts, addressNfts);

          cach = await this.cacheManager.set(`${address}`, nftItems);
        } else {
          nftItems = nftItems.concat(
            cach.filter(
              (i) => typeof i === 'object' && !isPromise(i) && i !== null,
            ),
          );
        }
      }),
    );

    const results = await Promise.all(
      nftItems.map(async (item) => {
        const query = await this.inventoryRepository
          .createQueryBuilder('i')
          .select(['i', 'c', 's', 'n'])
          .innerJoinAndSelect('i.contractData', 'c')
          .innerJoinAndSelect('c.source', 's')
          .innerJoinAndSelect('c.network', 'n')
          .where('i.contract = :contract', { contract: item.contract })
          .andWhere('i.token_value = :tokenValue', {
            tokenValue: item.token_value,
          });

        if (params?.gameCode) {
          query.andWhere('i.game_code = :gameCode', {
            gameCode: params?.gameCode,
          });
        }

        if (params?.name) {
          query.andWhere(`i.attributes::json ->> 'name' ilike :name`, {
            name: `%${params?.name}%`,
          });
        }

        const [items, totalCount] = await query
          .skip(params?.offset)
          .take(params?.first)
          .getManyAndCount();

        return {
          items,
          totalCount,
        };
      }),
    );

    let node = [];
    const resultParsed = results?.flatMap((obj) => [
      ...obj.items.map((item) => item),
    ]);
    if (resultParsed?.length > 0) {
      node = resultParsed.map((i) => mapCardTokenFn(i));
    }

    return {
      totalCount: node.length,
      edges: {
        node,
      },
      pageInfo: {
        hasNextPage: params?.offset + params?.first < node.length,
      },
    };
  }

  async getExchangeRates(code: string): Promise<number> {
    const exchanges = this.cacheManager.get('exchanges:native');
    if (!code) {
      return 0;
    }
    const currency = await this.getCurrencyByGameCode(code);
    if (exchanges) {
      return exchanges[currency];
    }
    try {
      const response = await lastValueFrom(
        this.httpService.get(`https://blockchain.info/ticker?base=${currency}`),
      );
      if (response.status === 200) {
        const value = { [currency]: response.data[Currency.USD].last };
        const values = exchanges ? { ...exchanges, ...value } : value;
        await this.cacheManager.set('exchanges:native', values, 600000);

        return value[currency];
      }
    } catch (err) {
      return 0;
    }
  }

  async getExchangeRatesByCurrency(currency: Currency): Promise<number> {
    if (!currency) {
      return 0;
    }
    const response = await lastValueFrom(
      this.httpService.get(`https://blockchain.info/ticker?base=${currency}`),
    );
    if (response.status === 200) {
      return response.data['USD']?.last ?? 0;
    }
    return 0;
  }

  async convertCurrency(from: Currency, to: Currency): Promise<number> {
    const response = await lastValueFrom(
      this.httpService.get(
        `https://min-api.cryptocompare.com/data/price?fsym=${from}&tsyms=${to}`,
      ),
    );
    if (response.status === 200) {
      return response.data[to];
    }
    return 0;
  }

  async getCurrencyByGameCode(code: string): Promise<Currency> {
    let contract;
    if (code) {
      contract = await this.getGameContractById(code);
    }
    return contract?.network?.currency || Currency.MATIC;
  }

  async getCurrencyByContract(contract: string): Promise<Currency> {
    const result = await this.contractService.getContractById(contract);
    return result?.network?.currency || Currency.MATIC;
  }

  async getGameContractById(code: string) {
    return this.contractRepository.findOne({
      relations: ['network'],
      where: {
        game_code: code,
      },
    });
  }

  async getFilters(params: GameTokenFilterParams) {
    let uniqueGameBlockchains = [],
      gameBlockchains;
    if (params?.gameCode) {
      const blockchains = await this.contractRepository.find({
        where: {
          game_code: params.gameCode,
        },
      });

      gameBlockchains = blockchains.map((element) => ({
        code: element?.blockchain,
        title: element?.blockchain,
        checked: true,
        disable: false,
        coins: [],
      }));
      uniqueGameBlockchains = getUniqueArr(gameBlockchains, 'code');

      const items = await getManager().query(
        `SELECT DISTINCT i.coin_address 
        FROM inventory.items i 
        WHERE game_code = '${params?.gameCode}'`,
      );

      await Promise.all(
        items.map(async (elem) => {
          await Promise.all(
            uniqueGameBlockchains.map(async (blockchain) => {
              const coinInfo = await this.coinInfoRepository.findOne({
                where: {
                  contract:
                    elem?.coin_address ??
                    '0x0000000000000000000000000000000000000000',
                  blockchain: blockchain.code,
                },
                select: ['symbol', 'contract', 'blockchain'],
              });
              if (coinInfo?.symbol) {
                const coin = {
                  code: coinInfo.symbol,
                  title: coinInfo.symbol,
                  coin_address: coinInfo.contract,
                  blockchain: coinInfo.blockchain,
                  checked: true,
                  disable: false,
                };
                blockchain.coins.push(coin);
                blockchain.coins = getUniqueArr(blockchain.coins, 'code');
              }
            }),
          );
        }),
      );
    }

    return [
      {
        key: 'saleType',
        title: 'Sale Type',
        type: FilterType.CHECKBOX,
        items: [
          {
            code: SaleType.FIXED_PRICE,
            title: 'Buy now',
            checked: true,
            disable: false,
          },
          {
            code: SaleType.NOT_FOR_SALE,
            title: 'Not for sale',
            checked: false,
            disable: false,
          },
        ],
      },
      {
        key: 'PRICE',
        title: 'Price Range',
        type: FilterType.MIN_MAX,
      },
      {
        key: 'gameBlockchains',
        title: 'Blockchains',
        type: FilterType.COINCHECKBOX,
        items: uniqueGameBlockchains,
      },
    ];
  }

  async getItemsBySource(params: GameItemsParams): Promise<any> {
    return await this.inventoryRepository.find({
      relations: ['contractData'],
      where: {
        contractData: {
          game_code: params.gameCode,
        },
      },
      skip: params.offset,
      take: params.first,
    });
  }

  async getItemsBySourceCount(game_code: string): Promise<number> {
    return this.inventoryRepository.count({
      relations: ['contractData'],
      where: {
        contractData: {
          game_code,
        },
      },
    });
  }

  async getItemsDistributionByBlockchains(): Promise<any> {
    return await getManager().query(`
        SELECT ib.blockchain, COUNT(ib.blockchain)
        FROM (SELECT items.id, contracts.blockchain
              FROM inventory.items AS items
                       INNER JOIN inventory.contracts AS contracts
                                  ON items.contract = contracts.contract
              WHERE items.price > 0) AS ib
        GROUP BY ib.blockchain
    `);
  }

  async getItemsCountWithContractsByGameCode(source: string): Promise<number> {
    return await this.inventoryRepository.count({
      relations: ['contractData'],
      where: { contractData: { game_code: source } },
    });
  }

  async getItemsOnSaleCountWithContractsByGameCode(
    source: string,
  ): Promise<number> {
    const cache = await this.cacheManager.get(`${source}:on_sale`);

    if (cache > 0 || cache == 0) {
      return cache;
    } else {
      const items = await this.inventoryRepository.count({
        relations: ['contractData'],
        where: { contractData: { game_code: source }, price: MoreThan(0) },
      });
      await this.cacheManager.set(`${source}:on_sale`, items);

      return items;
    }
  }

  async getItemsCountByWalletsList(wallets: Wallet[]): Promise<number> {
    return await this.inventoryRepository.count({
      where: { wallet: In(wallets.map((w) => w.address)) },
    });
  }

  async getItemLikesCount(item_id: number): Promise<number> {
    if (!item_id) return 0;
    return this.inventoryLikeRepository.count({
      where: { item_id },
    });
  }

  async changeItemLike(item_id: number, user_id: string): Promise<boolean> {
    try {
      const like = await this.inventoryLikeRepository.findOne({
        where: {
          item_id,
          user_id,
        },
      });
      if (like) {
        await this.inventoryLikeRepository.delete(like.id);
      } else {
        await this.inventoryLikeRepository.insert({ item_id, user_id });
      }

      return true;
    } catch {
      return false;
    }
  }

  async isItemLike(user_id: string, item_id: number): Promise<boolean> {
    const like = await this.inventoryLikeRepository.findOne({
      where: { item_id, user_id },
    });
    return !!like;
  }

  getTokensCount(): Promise<number> {
    return this.inventoryRepository.count();
  }

  async getTokensSiteMap(chunk = 0): Promise<{ loc: string }[]> {
    const chunkLimit = 30000;
    const offset = chunkLimit * chunk;
    try {
      const tokens = await this.inventoryRepository.find({
        relations: ['contractData', 'contractData.source'],
        select: ['id', 'token_value', 'update_time', 'contractData'],
        take: chunkLimit,
        skip: offset,
      });
      return tokens.map((token) => {
        return {
          loc: `https://gametrade.market/marketplace/token/${token.contractData.blockchain}/${token.contractData.contract}/${token.token_value}`,
          lastmod: moment(),
        };
      });
    } catch (err) {
      this.logger.error(
        `generate sitemap tokens => ${chunk} ${err.message}`,
        err,
      );
      return [];
    }
  }

  async getTokensByChunk(chunk = 0) {
    const chunkLimit = 30000;
    const offset = chunkLimit * chunk;
    try {
      return this.inventoryRepository.find({
        relations: [
          'contractData',
          'contractData.source',
          'contractData.network',
        ],
        select: ['id', 'token_value', 'update_time', 'contractData'],
        take: chunkLimit,
        skip: offset,
      });
    } catch (err) {
      this.logger.error(
        `generate sitemap tokens => ${chunk} ${err.message}`,
        err,
      );
      return [];
    }
  }

  async getAllCollectionsByPlatform(platform: string) {
    return this.inventoryRepository.find({
      select: ['token_value', 'contract'],
      relations: ['contractData'],
      where: { platform },
    });
  }

  async getFloorPrice(source: string): Promise<string> {
    const [response] = await getManager().query(
      `
      SELECT min("i"."price") AS "floor_price" 
      FROM "inventory"."items" "i" 
      INNER JOIN "inventory"."contracts" "c" ON "c"."contract"="i"."contract" 
      WHERE "c"."game_code" = '${source}' and "i"."price" > 0
      `,
    );

    return ethers.utils.formatEther(response?.floor_price || 0) || null;
  }

  async getTopSailTokens(
    params: GetTopSailTokensQuery,
  ): Promise<CardConnection> {
    const { limit: take, offset: skip, gameCode } = params;

    const [items, totalCount] = await this.inventoryRepository
      .createQueryBuilder('i')
      .innerJoinAndSelect('i.contractData', 'c')
      .innerJoinAndSelect('c.source', 's')
      .innerJoinAndSelect('c.network', 'n')
      .where('c.game_code = :gameCode', { gameCode })
      .addOrderBy('i.price', 'DESC', 'NULLS LAST')
      .offset(skip)
      .limit(take)
      .getManyAndCount();

    const source_currency = await this.sourceCurrencyRepository.findOne({
      relations: ['coin'],
      where: {
        game_code: gameCode,
      },
    });

    if (!source_currency) {
      await this.exchangeService.saveCoinInfoByContractId(
        items[0].coin_address,
        items[0].blockchain,
      );
    }

    const node = items.map((item) =>
      mapCardTokenFn(item, source_currency?.coin),
    );

    return {
      totalCount,
      edges: {
        node,
      },
      pageInfo: {
        hasNextPage: skip + take < totalCount,
      },
    };
  }
}
