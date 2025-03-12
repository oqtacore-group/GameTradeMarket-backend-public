import { Injectable } from '@nestjs/common';
import { CardProp } from '../inventory/interfaces/card.interface';
import { Blockchain } from '../blockchain/interfaces/blockchain.interface';

export interface IItem {
  readonly contract: string;
  readonly token_value: string;
  readonly price: number;
  readonly fee?: number;
  readonly wallet: string;
  readonly token_uri: string;
  readonly approved: boolean;
  readonly attributes: {
    name: string;
    description?: string;
    picture: string;
    attributes: CardProp[];
  };
}

export interface IOptions {
  asset_contract: string;
  id: number | string;
  blockchain: Blockchain;
}

@Injectable()
export abstract class BaseProvider {
  public abstract get(options: IOptions): Promise<IItem>;
}
