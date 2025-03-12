export interface IUser {
  sub: string;
  ver: number;
  act?: {
    sub: string;
  };
  iat: number;
  exp: number;
  iss: string;
}

export interface IOAuthGoogle {
  client_id: string;
  client_secret: string;
}
