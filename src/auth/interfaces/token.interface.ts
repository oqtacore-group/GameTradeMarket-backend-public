export interface IAccessToken {
  sub: string;
  ver: string;
  act?: {
    sub: string;
  };
  // FIXME replace name with environment variable
  name?: 'GameTradeMarket';
}

export interface IRefreshToken {
  // FIXME replace name with environment variable
  ver: string;
  name?: 'GameTradeMarket';
}
