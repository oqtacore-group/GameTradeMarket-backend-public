export interface IAddContract {
  contract: string;
  name: string;
  game_code: string;
  mapping: Record<string, string>;
  blockchain: string;
  is_test?: boolean;
}

export interface IGetPrice {
  price: number;
  fee: number;
  seller: string;
}
