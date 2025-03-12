import Web3 from 'web3';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NetworkEntity } from './models/network.entity';
import { Blockchain, IGetNetwork } from './interfaces/blockchain.interface';
import { Nullable } from '../utils/interfaces/utils.interface';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import HDWalletProvider from '@truffle/hdwallet-provider';
import { utils } from 'ethers';
import { default as CommonEthereumJS } from '@ethereumjs/common';
import { Transaction as Tx } from 'ethereumjs-tx';
import { Card } from '../inventory/interfaces/card.interface';

const NETWORK = 'polygon-mainnet';
const INFURA_KEY = process.env.INFURA_KEY;
const INFURA_URL = `https://${NETWORK}.infura.io/v3/${INFURA_KEY}`;

// CONSTANTS
const ADDRESS_GAMETRADE_CONTRACT = '0x42EB1C303401bb8417B5589CdBae154272a6473A';
const CONFIG_NETWORK_POLYGON =
  NETWORK === 'polygon-mainnet'
    ? CommonEthereumJS.forCustomChain(
        'mainnet',
        {
          name: 'matic-mainnet',
          networkId: 137,
          chainId: 137,
          url: 'https://rpc-mainnet.maticvigil.com/',
        },
        'istanbul',
      )
    : {};

const ABI_ERC721: any = {
  abi: [
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'approve',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'mint',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'from',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'safeTransferFrom',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'from',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
        {
          internalType: 'bytes',
          name: '_data',
          type: 'bytes',
        },
      ],
      name: 'safeTransferFrom',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          internalType: 'bool',
          name: 'approved',
          type: 'bool',
        },
      ],
      name: 'setApprovalForAll',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'from',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'transferFrom',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'from',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'Transfer',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'approved',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'Approval',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'operator',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'bool',
          name: 'approved',
          type: 'bool',
        },
      ],
      name: 'ApprovalForAll',
      type: 'event',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
      ],
      name: 'balanceOf',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'getApproved',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'operator',
          type: 'address',
        },
      ],
      name: 'isApprovedForAll',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'ownerOf',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'bytes4',
          name: 'interfaceId',
          type: 'bytes4',
        },
      ],
      name: 'supportsInterface',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
  ],
};

const ABI_Gametrade_TraderContract_ERC721: any = [
  {
    inputs: [
      {
        internalType: 'address payable',
        name: '_feeAddress',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'nftContract',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'erc20Contract',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'buyer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'BuyTokenListing',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'nftContract',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
    ],
    name: 'RemoveTokenListing',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'feePercents',
        type: 'uint256',
      },
    ],
    name: 'SetFeePercents',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'maxFee',
        type: 'uint256',
      },
    ],
    name: 'SetMaxFee',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'minFee',
        type: 'uint256',
      },
    ],
    name: 'SetMinFee',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'nftContract',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'erc20Contract',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'SetPriceListing',
    type: 'event',
  },
  {
    inputs: [],
    name: 'FeeAddress',
    outputs: [
      {
        internalType: 'address payable',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nft',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256',
      },
    ],
    name: 'buyToken',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_price',
        type: 'uint256',
      },
    ],
    name: 'getFee',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getFeePercents',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMaxFee',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMinFee',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nft',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256',
      },
    ],
    name: 'getPrice',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_feePercents',
        type: 'uint256',
      },
    ],
    name: 'setFeePercents',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_maxFee',
        type: 'uint256',
      },
    ],
    name: 'setMaxFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_minFee',
        type: 'uint256',
      },
    ],
    name: 'setMinFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_price',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_coin',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_nft',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256',
      },
    ],
    name: 'setPrice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'test_buyTokenERC20',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawAllFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

@Injectable()
export class BlockchainService {
  private currentNetwork: Nullable<IGetNetwork>;

  constructor(
    private httpService: HttpService,
    @InjectRepository(NetworkEntity)
    private readonly networkRepository: Repository<NetworkEntity>,
  ) {}

  async getByCode(code: Blockchain): Promise<Nullable<IGetNetwork>> {
    if (this.currentNetwork) return this.currentNetwork;
    const network = await this.networkRepository.findOne({
      where: { code },
    });
    if (!network) return null;
    return {
      ...network,
      wb: new Web3(network.rpc_url),
    };
  }

  async approveERC721(privateKeyOwner, addressOwner, tokenAddress, tokenID) {
    return new Promise(async (resolve, reject) => {
      try {
        const provider = new HDWalletProvider([privateKeyOwner], INFURA_URL);
        const web3 = new Web3(provider);

        const tokenContract = new web3.eth.Contract(
          ABI_ERC721.abi,
          tokenAddress,
        );
        web3.eth.accounts.wallet.add(privateKeyOwner);

        const nonce = await web3.eth.getTransactionCount(
          addressOwner,
          'latest',
        );
        const gasPrice = await this.getGasPrice().catch((e) => {
          console.log('gas price error', e);
        });

        const tx = await tokenContract.methods.approve(
          ADDRESS_GAMETRADE_CONTRACT,
          tokenID,
        );
        const data = tx.encodeABI();

        const txData: any = {
          from: addressOwner,
          gas: utils.hexlify(6000000), // 120000 lastBlock.gasLimit
          gasPrice,
          to: tokenAddress,
          nonce,
          data,
        };
        const isPolygon = NETWORK === 'polygon-mainnet';
        const options: any = isPolygon
          ? { common: CONFIG_NETWORK_POLYGON }
          : { chain: NETWORK };
        const key = privateKeyOwner.replace('0x', '');
        const privateKey = Buffer.from(key, 'hex');
        const transaction = new Tx(txData, options);
        transaction.sign(privateKey);
        const serializedTx = transaction.serialize();
        web3.eth
          .sendSignedTransaction('0x' + serializedTx.toString('hex'))
          .on('transactionHash', async function (hash) {
            // console.log('hash', hash);
          })
          .on('receipt', (receipt) => {
            // console.log('receipt', receipt);
          })
          .on('confirmation', (confirmationNumber, receipt) => {
            // console.log(
            //   'confirmationNumber, receipt',
            //   confirmationNumber,
            //   receipt,
            // );

            return resolve(0);
          })
          .on('error', (error) => {
            console.error('error, receipt', error.message);
            return reject(error);
          })
          .catch((error) => {
            console.log('e', error);
            return reject(error);
          });
      } catch (e) {
        reject(e);
      }
    });
  }

  async sendNotification(token, buyer, seller) {
    if (!token) return;
    const body = {
      username: process.env.NOTIFICATION_BOT_USERNAME,
      password: process.env.NOTIFICATION_BOT_PASSWORD,
      data: {
        Event: 'sale',
        Name: token.attributes.name,
        Image: token.picture,
        Collection: token.contractData.source.name,
        Collection_slug: token.contractData.source.code,
        Timestamp: new Date(),
        Price: token.price,
        Currency: 'MATIC',
        From: seller.address,
        From_username: '',
        To: buyer.address,
        To_username: null,
        Token_contract: token.contract,
        Token_id: token.token_value,
        Token_link: token.token_uri,
        Collection_link: null,
        Created_collection: '2021-11-22T04:46:12.749699+00:00',
        Payout_address: buyer.address,
        Transaction_hash: null,
        Transaction_block_number: null,
        Transaction_block_hash: null,
        Quantity: '1',
        Instagram_username: null,
        Telegram_url: null,
        Twitter_username: null,
        Discord_url: null,
      },
    };

    await lastValueFrom(
      this.httpService.post(
        `${process.env.NOTIFICATION_BOT_URL}/send-message`,
        body,
      ),
    );
  }

  async buyTokenERC721(
    privateKeyBuyer,
    addressBuyer,
    tokenAddress,
    tokenID,
    value = 10000000000000000,
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        const provider = new HDWalletProvider([privateKeyBuyer], INFURA_URL);
        const web3 = new Web3(provider);

        const gametradeContract = new web3.eth.Contract(
          ABI_Gametrade_TraderContract_ERC721,
          ADDRESS_GAMETRADE_CONTRACT,
        );
        web3.eth.accounts.wallet.add(privateKeyBuyer);

        const nonce = await web3.eth.getTransactionCount(
          addressBuyer,
          'latest',
        );
        const gasPrice = await this.getGasPrice().catch((e) => {
          console.log('gas price error', e);
        });

        const txGetFee = await gametradeContract.methods
          .getFee(String(value))
          .call();
        const fee = Number(txGetFee.toString());

        // buyToken: [, tokenID]
        const tx = await gametradeContract.methods.buyToken(
          tokenAddress,
          tokenID,
        );
        const data = tx.encodeABI();

        const txData: any = {
          from: addressBuyer,
          gas: utils.hexlify(6000000), // 120000 lastBlock.gasLimit
          gasPrice,
          to: ADDRESS_GAMETRADE_CONTRACT,
          nonce,
          data,
          value: value + fee,
        };
        const isPolygon = NETWORK === 'polygon-mainnet';
        const options: any = isPolygon
          ? { common: CONFIG_NETWORK_POLYGON }
          : { chain: NETWORK };
        const key = privateKeyBuyer.replace('0x', '');
        const privateKey = new Buffer(key, 'hex');
        const transaction = new Tx(txData, options);
        transaction.sign(privateKey);
        const serializedTx = transaction.serialize();

        await web3.eth
          .sendSignedTransaction('0x' + serializedTx.toString('hex'))
          .on('transactionHash', async function (hash) {
            // console.log('hash', hash);
          })
          .on('receipt', function (receipt) {
            // console.log('receipt', receipt);
          })
          .on('confirmation', async function (confirmationNumber, receipt) {
            // console.log(
            //   'confirmationNumber, receipt',
            //   confirmationNumber,
            //   receipt,
            // );
            return resolve(0);
          })
          .on('error', (error) => {
            console.log('error, receipt', error.message);
            return reject(error);
          })
          .catch((e) => {
            console.log('e', e);
            return reject(e);
          });
      } catch (e) {
        reject(e);
      }
    });
  }

  async getGasPrice(speed = 'fastest') {
    const multiplier = 1000000000;
    let gasPrice = 0;
    try {
      const response = await lastValueFrom(
        this.httpService.get('https://gasstation-mainnet.matic.network'),
      );
      let _a;
      const result = (_a = response.data) !== null && _a !== void 0 ? _a : {};
      let newGasPrice = result[speed] * multiplier;
      if (!newGasPrice) newGasPrice = result['fast'] * multiplier;
      if (newGasPrice !== gasPrice) {
        gasPrice = newGasPrice;
      }
      return gasPrice;
    } catch (e) {
      return null;
    }
  }

  async setPriceERC721(
    privateKeyOwner,
    addressOwner,
    tokenAddress,
    tokenID,
    price,
    coin = '0x0000000000000000000000000000000000000000',
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        const provider = new HDWalletProvider([privateKeyOwner], INFURA_URL);
        const web3 = new Web3(provider);

        const tokenContract = new web3.eth.Contract(
          ABI_Gametrade_TraderContract_ERC721,
          ADDRESS_GAMETRADE_CONTRACT,
        );
        web3.eth.accounts.wallet.add(privateKeyOwner);

        const nonce = await web3.eth.getTransactionCount(
          addressOwner,
          'latest',
        );
        const gasPrice = await this.getGasPrice().catch((e) => {
          console.log('gas price error', e);
        });

        // approve: [to, tokenID]
        const tx = await tokenContract.methods.setPrice(
          price,
          coin,
          tokenAddress,
          tokenID,
        );
        const data = tx.encodeABI();

        const txData: any = {
          from: addressOwner,
          gas: utils.hexlify(6000000), // 120000 lastBlock.gasLimit
          gasPrice,
          to: ADDRESS_GAMETRADE_CONTRACT,
          nonce,
          data,
        };
        const key = privateKeyOwner.replace('0x', '');
        const privateKey = Buffer.from(key, 'hex');
        const isPolygon = NETWORK === 'polygon-mainnet';
        const options: any = isPolygon
          ? { common: CONFIG_NETWORK_POLYGON }
          : { chain: NETWORK };
        const transaction = new Tx(txData, options);
        transaction.sign(privateKey);
        const serializedTx = transaction.serialize();

        await web3.eth
          .sendSignedTransaction('0x' + serializedTx.toString('hex'))
          .on('transactionHash', async function (hash) {
            // console.log('hash', hash);
          })
          .on('receipt', function (receipt) {
            // console.log('receipt', receipt);
          })
          .on('confirmation', async function (confirmationNumber, receipt) {
            // console.log(
            //   'confirmationNumber, receipt',
            //   confirmationNumber,
            //   receipt,
            // );
            return resolve(0);
          })
          .on('error', (error) => {
            console.log('error, receipt', error.message);
            return reject(error);
          })
          .catch((e) => {
            console.log('e', e);
            return reject(e);
          });
      } catch (e) {
        reject(e);
      }
    });
  }

  async getNetworks(): Promise<IGetNetwork[]> {
    const data = await this.networkRepository.find({
      where: { is_enabled: true },
    });
    return data.map((d) => {
      return {
        currency: d.currency,
        code: d.code,
        name: d.name,
        trade_contract: d.trade_contract,
        wb: new Web3(d.rpc_url),
      };
    });
  }
}
