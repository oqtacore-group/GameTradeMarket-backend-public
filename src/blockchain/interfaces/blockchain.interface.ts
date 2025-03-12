// FIXME create a common interface
import Web3 from 'web3';

export enum Blockchain {
  ETHEREUM = 'ethereum_mainnet',
  POLYGON = 'polygon',
  GOERLI = 'goerli',
  BINANCE = 'binance',
}

export interface IGetNetwork {
  code?: Blockchain;
  currency?: string;
  decimals?: number;
  name?: string;
  contract?: string;
  trade_contract?: string;
  wb?: Web3;
}
