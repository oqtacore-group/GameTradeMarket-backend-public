import {
  Injectable,
  OnApplicationBootstrap,
  UnauthorizedException,
} from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { IAccessToken, IRefreshToken } from './interfaces/token.interface';
import { OAuth2Client } from 'google-auth-library';
import { IOAuthGoogle, IUser } from './interfaces/user.interface';
import { SecretManagerService } from '../utils/secret-manager/secret-manager.service';
import { parseToken } from '../utils';
import { TokenPayload } from 'google-auth-library/build/src/auth/loginticket';
import moment from 'moment';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from '../account/models/account.entity';
import { Repository } from 'typeorm';
import { Environment } from '../utils/interfaces/utils.interface';
import { DOMAIN } from '../utils/constants';
import { AccountSessionEntity } from '../account/models/account-session.entity';
import { AccessEntity } from '../account/models/access.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  readonly SALT_ROUNDS = 6;
  readonly is_develop: boolean;
  private _access_private_key: string;
  private _access_public_key: string;
  private _refresh_private_key: string;
  private _refresh_public_key: string;
  private _google_auth_data: IOAuthGoogle;
  private _googleClient: OAuth2Client;

  constructor(
    @InjectRepository(AccountEntity)
    public accountRepository: Repository<AccountEntity>,
    @InjectRepository(AccountSessionEntity)
    private readonly accountSessionRepository: Repository<AccountSessionEntity>,
    @InjectRepository(AccessEntity)
    public accessRepository: Repository<AccessEntity>,
    readonly secretManager: SecretManagerService,
    private configService: ConfigService,
  ) {
    this.is_develop =
      this.secretManager.configService.get('NODE_ENV') ===
      Environment.DEVELOPMENT;
  }

  async onApplicationBootstrap(): Promise<void> {
    this._access_private_key = await this.secretManager.getSecretValue(
      'PRIVATE_JWT_KEY',
    );
    this._access_public_key = await this.secretManager.getSecretValue(
      'PUBLIC_JWT_KEY',
    );
    this._refresh_private_key = await this.secretManager.getSecretValue(
      'PRIVATE_REFRESH_JWT_KEY',
    );
    this._refresh_public_key = await this.secretManager.getSecretValue(
      'PUBLIC_REFRESH_JWT_KEY',
    );
    this._google_auth_data =
      (await this.secretManager.getSecretValue<IOAuthGoogle>(
        'GOOGLE_AUTH_DATA',
      )) as IOAuthGoogle;
    this._googleClient = new OAuth2Client(
      this._google_auth_data.client_id,
      this._google_auth_data.client_secret,
    );
  }

  async verifyPlayerToken(token: string): Promise<boolean> {
    const account = await this.accountRepository.findOne({
      where: { player_token: token },
    });

    return !!account;
  }

  async verifyOverlayToken(token: string): Promise<AccountEntity> {
    try {
      const privateKey = this.configService.get<string>(
        'PRIVATE_OVERLAY_JWT_KEY',
      );
      const value = parseToken(token);
      const response = verify(value, privateKey, {
        algorithms: ['HS256'],
      });

      return this.accountRepository.findOne({
        where: { id: response?.sub },
      });
    } catch (err) {
      return null;
    }
  }

  _getRandomArbitrary(): number {
    const [min, max] = [111111, 999999];
    return Math.trunc(Math.random() * (max - min) + min);
  }

  _createAccessToken(payload: IAccessToken): {
    access_token: string;
    access_expires: Date;
  } {
    const now = moment();
    const amount = process.env.ACCESS_TOKEN_EXPIRES_MIN;
    now.add(amount, 'minutes');
    return {
      access_token: sign(payload, this._access_private_key, {
        issuer: `https://${this.is_develop ? 'qa.' : ''}${DOMAIN}`,
        audience: 'gametrade',
        algorithm: 'PS256',
        expiresIn: `${amount}m`,
      }),
      access_expires: now.toDate(),
    };
  }

  async _createRefreshToken(
    user_id: string,
    payload: IRefreshToken,
  ): Promise<{ refresh_token: string; refresh_expires: Date }> {
    const now = moment();
    const amount = process.env.REFRESH_TOKEN_EXPIRES_MIN;
    now.add(amount, 'minutes');
    return {
      refresh_token: `Bearer ${sign(payload, this._refresh_private_key, {
        issuer: `https://${this.is_develop ? 'qa.' : ''}${DOMAIN}`,
        audience: 'gametrade',
        algorithm: 'PS256',
        expiresIn: `${amount}d`,
      })}`,
      refresh_expires: now.toDate(),
    };
  }

  async verifyAccessToken(token: string): Promise<IUser | boolean> {
    try {
      const user = verify(parseToken(token), this._access_public_key, {
        algorithms: ['PS256'],
      }) as IUser;
      if (user) {
        const account = await this.accountRepository.findOne({
          where: { id: user.sub, version: user.ver },
        });
        return account ? (user as IUser) : false;
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  async verifyRefreshToken(token: string): Promise<boolean> {
    try {
      const data = verify(parseToken(token), this._refresh_public_key, {
        algorithms: ['PS256'],
      }) as IRefreshToken;
      const session = await this.accountSessionRepository.findOne({
        relations: ['user'],
        where: { token, user: { version: data.ver } },
      });
      return !!session;
    } catch (err) {
      return false;
    }
  }

  async verifyGoogle(token: string): Promise<TokenPayload> {
    try {
      const ticket = await this._googleClient.verifyIdToken({
        idToken: token,
        audience: this._google_auth_data.client_id,
      });
      return ticket.getPayload();
    } catch {
      throw new UnauthorizedException({
        message: 'Invalid token',
        code: 'TOKEN_INVALID',
      });
    }
  }

  async verifyApiKey(key: string): Promise<boolean> {
    if (!key) return false;
    const is_prod =
      this.configService.get('NODE_ENV') === Environment.PRODUCTION;
    const response = await this.accessRepository.findOne({
      api_key: key,
    });
    const is_expired =
      response.expires && Date.now() > new Date(response.expires).getTime();

    return !!response && response.is_active && !is_expired && is_prod
      ? response.env === 'PROD'
      : response.env === 'QA';
  }

  async verifyApiKeyUser(key: string): Promise<string> {
    if (!key) return null;
    const response = await this.accessRepository.findOne({
      api_key: key,
    });
    return response?.user_id;
  }
}
