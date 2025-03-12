import { Injectable, Logger } from '@nestjs/common';
import moment from 'moment';
import { AccountService } from '../account/account.service';
import { InventoryService } from '../inventory/inventory.service';
import { ListingService } from '../inventory/listings/listing.service';
import { StatisticsResponse } from './interfaces/admin.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemTransactionEntity } from '../inventory/models/item-transaction.entity';
import { Repository } from 'typeorm';
import { Blockchain } from '../blockchain/interfaces/blockchain.interface';
import Web3 from 'web3';
import { NetworkEntity } from '../blockchain/models/network.entity';
import { fromWei, toWei } from 'web3-utils';
import { isObject } from 'class-validator';
import AWS from 'aws-sdk';
import { BlockchainService } from '../blockchain/blockchain.service';
import { InventoryEntity } from '../inventory/models/inventory.entity';
import {
  CountLogs,
  LogParams,
  Logs,
  ListingsDto,
  SalesDto,
  ActivityInput,
  ActivitiesDto,
} from './dto';

@Injectable()
export class AdminService {
  private logger = new Logger(AdminService.name);

  constructor(
    private readonly accountService: AccountService,
    private readonly blockchainService: BlockchainService,
    private readonly inventoryService: InventoryService,
    private readonly listingService: ListingService,
    @InjectRepository(ItemTransactionEntity)
    private readonly itemTransactionRepository: Repository<ItemTransactionEntity>,
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepository: Repository<InventoryEntity>,
    @InjectRepository(NetworkEntity)
    private readonly networkRepository: Repository<NetworkEntity>,
  ) {}

  nowDate() {
    return moment()
      .utc()
      .set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
  }

  getLogsCount(): Promise<CountLogs> {
    //TODO OPENSEARCH
    return;
  }

  getLogs(params: LogParams): Promise<Logs> {
    //TODO OPENSEARCH
    return;
  }

  async getActivity(params: ActivityInput): Promise<ActivitiesDto> {
    const [node, totalCount] =
      await this.itemTransactionRepository.findAndCount({
        relations: [
          'seller',
          'buyer',
          'token',
          'token.contractData',
          'token.contractData.network',
          'token.contractData.source',
        ],
        order: { created_at: 'DESC' },
        skip: params.offset,
        take: params.first,
      });

    return {
      totalCount,
      edges: {
        node: node.map((item) => ({
          id: item.id,
          price: item.price,
          seller: item.seller,
          buyer: item.buyer,
          type_event: 'sold',
          token_id: item.token.token_value,
          token_name: item.token.attributes.name,
          game_name: item.token.contractData.source.name,
          created_at: item.created_at,
          blockchain: item.token.contractData.blockchain,
          currency: item.token.contractData.network.currency,
        })),
      },
      pageInfo: {
        hasNextPage: params.offset + params.first < totalCount,
      },
    };
  }

  addLog(
    eventName: string,
    context: string,
    response: string,
    duration: number,
    createAt: string,
  ) {
    // try {
    //   this._client.create({
    //     id: `${v4()}`,
    //     index: this._index_log,
    //     body: JSON.stringify({
    //       eventName,
    //       context,
    //       response,
    //       duration,
    //       createAt,
    //     }),
    //   });
    // } catch (err) {}
  }

  async getStatistics(): Promise<StatisticsResponse> {
    //
    // Users
    //

    const [usersAllTime, users24hours, users30days] = await Promise.all([
      this.accountService.getUsers({}),
      this.accountService.getUsers({
        create_date_from: this.nowDate().subtract(24, 'hours').toISOString(),
      }),
      this.accountService.getUsers({
        create_date_from: this.nowDate().subtract(30, 'days').toISOString(),
      }),
    ]);

    //
    // Listings
    //

    const [listingsAllTime, listings24hours, listings30days] =
      await Promise.all([
        this.listingService.getListingCount({}),
        this.listingService.getListingCount({
          create_date_from: this.nowDate().subtract(24, 'hours').toISOString(),
        }),
        this.listingService.getListingCount({
          create_date_from: this.nowDate().subtract(30, 'days').toISOString(),
        }),
      ]);

    return {
      table: [
        {
          value: 'Users',
          allTime: usersAllTime.totalCount,
          for24hours: users24hours.totalCount,
          for30days: users30days.totalCount,
          onlyFirstTime24hours: null,
        },

        {
          value: 'Listings',
          allTime: listingsAllTime,
          for24hours: listings24hours,
          for30days: listings30days,
          onlyFirstTime24hours: null,
        },
      ],

      blockchainsChart:
        await this.inventoryService.getItemsDistributionByBlockchains(),
    };
  }

  async getListings(): Promise<ListingsDto[]> {
    return []; //this.listingService.getListings();
  }

  async getSales(): Promise<SalesDto[]> {
    return [];
  }

  async buyRandomToken(): Promise<boolean> {
    const blockchain = Blockchain.POLYGON;
    const documentClient = new AWS.DynamoDB.DocumentClient();
    const network = await this.networkRepository.findOne({
      where: { code: blockchain },
    });
    const wb = new Web3(network.rpc_url);
    const wallets: any[] = await new Promise((resolve, reject) =>
      documentClient.scan(
        {
          TableName: 'wallets',
          Select: 'ALL_ATTRIBUTES',
        },
        (err, data) => {
          if (err) {
            this.logger.error(err.message);
            return reject(err);
          }
          return resolve(data.Items);
        },
      ),
    );
    const price = toWei('0.001', 'ether'); // MATIC
    let nft = null;
    let seller = null;
    let buyer = null;
    while (!nft) {
      seller = wallets[Math.floor(Math.random() * wallets.length)];
      if (!seller?.address) {
        continue;
      }
      const value = await wb.eth.getBalance(seller.address);
      if (value == '0') {
        continue;
      }
      this.logger.verbose(
        `Select random seller: ${seller.address} balance ${fromWei(
          value,
          'ether',
        )}`,
      );
      const nfts = await this.inventoryService.getNFTsItemsByUser(
        seller.address,
        blockchain,
      );
      nft = nfts[Math.floor(Math.random() * nfts.length)];
      if (isObject(nft)) {
        this.logger.verbose(`Get random nft: ${JSON.stringify(nft)}`);
      }
    }
    while (true) {
      const wallet = wallets.filter((address) => address !== seller)[
        Math.floor(Math.random() * wallets.length)
      ];
      if (!wallet?.address) {
        continue;
      }
      try {
        const value = await wb.eth.getBalance(wallet.address);
        if (Number(value) > 0) {
          buyer = wallet;
          this.logger.verbose(
            `Select random buyer: ${buyer.address} balance ${fromWei(
              value,
              'ether',
            )}`,
          );
          break;
        }
      } catch (err) {
        this.logger.error(err.message);
      }
    }
    if (!seller?.address || !buyer?.address || !nft?.contract) {
      return false;
    }
    const gasPrice = await this.blockchainService.getGasPrice();
    if (gasPrice > 0) {
      this.logger.verbose(`gas price ${fromWei(String(gasPrice), 'ether')}`);
    }
    await this.blockchainService.approveERC721(
      seller.privateKey,
      seller.address,
      nft.contract,
      nft.token_value,
    );
    await this.blockchainService.setPriceERC721(
      seller.privateKey,
      seller.address,
      nft.contract,
      nft.token_value,
      Number(price),
    );
    await this.blockchainService.buyTokenERC721(
      buyer.privateKey,
      buyer.address,
      nft.contract,
      nft.token_value,
      Number(price),
    );

    const token = await this.inventoryRepository.findOne({
      relations: ['contractData', 'contractData.source'],
      where: {
        contract: nft.contract,
        token_value: nft.token_value,
      },
    });

    await this.blockchainService.sendNotification(token, buyer, seller);

    return true;
  }
}
