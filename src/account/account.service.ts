import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository, Not } from 'typeorm';
import { AccountEntity } from './models/account.entity';
import { IAccountUser } from './account.interface';
import { UserFilters } from './interfaces/user.input';
import { UserConnection } from './dto/user.dto';
import { Nullable } from '../utils/interfaces/utils.interface';
import { AccountSessionEntity } from './models/account-session.entity';
import { IRefresh, ITokens } from '../auth/dto/token.dto';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../auth/auth.service';
import { SignupParams } from '../auth/interfaces/sign-in.input';
import { TemplateEnum } from '../mail/templates';
import { MailService } from '../mail/mail.service';
import { SecretManagerService } from '../utils/secret-manager/secret-manager.service';
import { Success } from '../utils/interfaces/response.interface';
import { ReviewEntity } from '../review/models/review.entity';
import { UserVisitEntity } from './models/user-visit.entity';
import { isEmail, isURL } from 'class-validator';
import { uid } from 'rand-token';
import {
  of,
  from,
  Observable,
  switchMap,
  map,
  forkJoin,
  lastValueFrom,
  tap,
  catchError,
} from 'rxjs';
import { IUser } from '../auth/interfaces/user.interface';

@Injectable()
export class AccountService {
  private logger = new Logger(AccountService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    readonly secretManagerService: SecretManagerService,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(UserVisitEntity)
    private readonly accountVisitRepository: Repository<UserVisitEntity>,
    @InjectRepository(AccountSessionEntity)
    private readonly accountSessionRepository: Repository<AccountSessionEntity>,
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,
    @InjectRepository(UserVisitEntity)
    private readonly userVisitRepository: Repository<UserVisitEntity>,
  ) {}

  async regeneratePlayerToken(user: IUser): Promise<string> {
    const player_token = this.genPlayerToken();
    await this.accountRepository.update(
      {
        id: user.sub,
      },
      {
        player_token,
      },
    );

    return player_token;
  }

  genPlayerToken(): string {
    const n = 4;
    const newArr = [];
    const value = uid(12).toUpperCase();
    for (let i = 0; i < 3; i++) {
      newArr.push(value.substr(i * n, n));
    }
    return newArr.join('-');
  }

  checkExisingPromoCode(promoCode: string): Observable<boolean> {
    const getUserPromise = this.accountRepository.findOne({
      where: { promoCode },
    });

    return from(getUserPromise).pipe(map((user) => Boolean(user)));
  }

  async getUsers(
    { offset, first, create_date_from, nick_name, hide_me }: UserFilters,
    owner?: any,
  ): Promise<UserConnection> {
    const query = this.accountRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.roles', 'r')
      .leftJoinAndSelect('u.wallets', 'w');

    if (create_date_from) {
      query.andWhere('u.create_time >= :create_date_from', {
        create_date_from,
      });
    }

    if (nick_name) {
      query.andWhere('u.nick_name ilike :nick_name', {
        nick_name: `%${nick_name}%`,
      });
    }

    if (hide_me) {
      query.andWhere('u.id != :id', {
        id: owner.sub,
      });
    }

    const [node, totalCount] = await query
      .take(first)
      .skip(offset)
      .addOrderBy('u.last_visited', 'DESC', 'NULLS LAST')
      .getManyAndCount();

    return {
      totalCount,
      edges: {
        node,
      },
      pageInfo: {
        hasNextPage: offset + first < totalCount,
      },
    };
  }

  async getUsersCount(): Promise<number> {
    return this.accountRepository.count();
  }

  getUserById(id: string): Promise<AccountEntity> {
    return this.accountRepository.findOne({
      relations: ['wallets', 'roles'],
      where: { id },
    });
  }

  getUserByCustomUrl(custom_url: string): Promise<AccountEntity> {
    return this.accountRepository.findOne({
      relations: ['wallets', 'roles'],
      where: { custom_url },
    });
  }

  getUserByEmail(email: string): Promise<AccountEntity> {
    return this.accountRepository.findOne({ where: { email } });
  }

  async addVisit(user_id: string): Promise<void> {
    const visit = await this.accountVisitRepository.findOne({
      user_id,
      visited_at: new Date(),
    });
    if (!visit) {
      await this.accountVisitRepository.save({
        user_id,
        visited_at: new Date(),
      });
    }
  }

  setEmailVerify(email: string): Observable<boolean> {
    if (!isEmail(email)) {
      return of(false);
    }
    const getUserPromise = this.accountRepository.findOne({ where: { email } });

    return from(getUserPromise).pipe(
      switchMap((user) => {
        return this.accountRepository.update(
          { id: user.id },
          {
            email_verified: true,
            mail_code: null,
          },
        );
      }),
      map((updateResolve) => Boolean(updateResolve.affected)),
    );
  }

  setPromoCode(email: string): Observable<boolean> {
    if (!isEmail(email)) {
      return of(false);
    }
    const getUserPromise = this.accountRepository.findOne({ where: { email } });

    return from(getUserPromise).pipe(
      switchMap((user) => {
        const hashPromise = bcrypt.hash(user.id, 5);
        return forkJoin([of(user), from(hashPromise)]);
      }),
      switchMap(([user, hash]) => {
        return this.accountRepository.update(
          { id: user.id },
          {
            promoCode: String(hash)
              .slice(7)
              .replace(/[^a-z\d\s]+/gi, '')
              .substr(0, 8)
              .toUpperCase(),
          },
        );
      }),
      map((updateResolve) => Boolean(updateResolve.affected)),
    );
  }

  createUser(payload: IAccountUser): Promise<AccountEntity> {
    return this.accountRepository.create(payload).save();
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await getManager().transaction(async (t) => {
        await t.delete(AccountSessionEntity, { user_id: id });
        await t.delete(AccountEntity, { id });
        return true;
      });
    } catch {
      return false;
    }
  }

  getUserByToken(token: string): Promise<Nullable<AccountEntity>> {
    return getManager()
      .createQueryBuilder(AccountEntity, 'a')
      .innerJoin(AccountSessionEntity, 's', 's.user_id = a.id')
      .where('s.token = :token', { token })
      .getOne();
  }

  async deleteSessionsByUserId(user_id: string): Promise<boolean> {
    return !!(await this.accountSessionRepository.delete({ user_id })).affected;
  }

  async setSessionToken(user_id: string, token: string): Promise<void> {
    return getManager().transaction(async (t) => {
      await t.delete(AccountSessionEntity, { user_id });
      await t.insert(AccountSessionEntity, { user_id, token });
    });
  }

  async updateUser(
    user_id: string,
    payload: IAccountUser,
  ): Promise<AccountEntity> {
    if (payload?.custom_url) {
      const userWithCustomUrl = await this.accountRepository.findOne({
        where: { custom_url: payload.custom_url, id: Not(user_id) },
      });
      if (userWithCustomUrl) {
        throw new BadRequestException({
          message: 'Custom url already exists',
          code: 'CUSTOM_URL_ALREADY_EXISTS',
        });
      }
    }

    if (payload?.custom_url === '') {
      payload.custom_url = null;
    }

    if (Array.isArray(payload?.social) && payload.social.length > 0) {
      if (payload.social.filter((social) => !isURL(social.value)).length > 0) {
        throw new BadRequestException({
          message: 'Social url not valid',
          code: 'SOCIAL_URL_NOT_VALID',
        });
      }
    }

    await this.accountRepository.update(user_id, {
      ...payload,
    });
    return this.getUserById(user_id);
  }

  async signIn(email: string, password: string): Promise<ITokens> {
    const account = await this.getUserByEmail(email);
    const is_psw_valid = await bcrypt.compare(
      password,
      account?.password || '',
    );
    if (!is_psw_valid) {
      throw new UnauthorizedException({
        message: 'Invalid login or password',
        code: 'LOGIN_INVALID_ACCOUNT',
      });
    }
    if (!account.email_verified) {
      throw new UnauthorizedException({
        message: 'Your email is not verified',
        code: 'LOGIN_ERROR_EMAIL_IS_NOT_VERIFIED',
      });
    }
    const { refresh_token, refresh_expires } =
      await this.authService._createRefreshToken(account.id, {
        ver: account.version,
      });
    const { access_expires, access_token } =
      this.authService._createAccessToken({
        sub: account.id,
        ver: account.version,
      });
    await this.setSessionToken(account.id, refresh_token);

    await this.addVisit(account.id);

    return {
      access_token,
      access_expires,
      refresh_token,
      refresh_expires,
    };
  }

  async signUp(params: SignupParams): Promise<Success> {
    let account = await this.getUserByEmail(params.email);
    if (account) {
      throw new BadRequestException({
        message: 'Account already exists',
        code: 'USER_ALREADY_EXISTS',
      });
    }

    const verifyPromoCode = await lastValueFrom(
      this.checkExisingPromoCode(params.invitedBy),
    );

    if (!verifyPromoCode && Boolean(params.invitedBy)) {
      throw new BadRequestException({
        message:
          'Sorry, the entered promo code does not exist or is not active anymore',
        code: 'PROMO_CODE_DOES_NOT_EXISTS',
      });
    }

    const [nick_name] = params.email.split('@');
    const _password_hash = await bcrypt.hash(
      params.password,
      this.authService.SALT_ROUNDS,
    );
    const _mail_code = this.authService._getRandomArbitrary();
    const player_token = this.genPlayerToken();

    let custom_url = nick_name;
    const customUrlExists = await this.getUserByCustomUrl(custom_url);
    if (customUrlExists) custom_url += Math.floor(Math.random() * 10000);

    account = await this.createUser({
      email: params.email,
      nick_name,
      locale: params.locale,
      password: _password_hash,
      mail_code: _mail_code,
      invitedBy: params.invitedBy,
      referrerLink: params.referrerLink,
      player_token,
      custom_url,
    });
    // TODO extract text strings
    await this.mailService.send({
      from: this.secretManagerService.configService.get('MAIL_SENDER'),
      to: account.email,
      subject: `Welcome to Game Trade Market. Your code is ${account.mail_code}`,
      templateName: TemplateEnum.TMP_WELCOME,
      params: {
        email: account.email,
        code: account.mail_code,
      },
    });
    return { message: 'Signup success', code: 'SIGNUP_USER_SUCCESS' };
  }

  async refresh(token: string): Promise<IRefresh> {
    if (!token) {
      throw new UnauthorizedException({
        message: 'Cookie not found',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }
    const is_verify = await this.authService.verifyRefreshToken(token);
    if (!is_verify) {
      throw new UnauthorizedException({
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }
    const account = await this.getUserByToken(token);
    if (!account) {
      throw new UnauthorizedException({
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }
    // const { refresh_token, refresh_expires } =
    //   await this.authService._createRefreshToken(account.id, {
    //     ver: account.version,
    //   });
    const { access_expires, access_token } =
      this.authService._createAccessToken({
        sub: account.id,
        ver: account.version,
      });
    // await this.setSessionToken(account.id, refresh_token);
    return {
      access_token,
      access_expires,
    };
  }

  // verify email
  verify(
    email: string,
    code: number,
  ): Observable<{ message: string; code: string }> {
    const userPromise = this.getUserByEmail(email);

    return from(userPromise).pipe(
      tap((user) => {
        if (!user || user.mail_code !== code) {
          throw new BadRequestException({
            message: 'Invalid email or code',
            code: 'LOGIN_INVALID_EMAIL_OR_CODE',
          });
        }
        if (user.email_verified) {
          throw new BadRequestException({
            message: 'Mail already verified',
            code: 'MAIL_ALREADY_VERIFIED',
          });
        }
      }),
      switchMap(() =>
        forkJoin([this.setEmailVerify(email), this.setPromoCode(email)]),
      ),
      map(() => {
        return { message: 'Verify success', code: 'VERIFY_SUCCESS' };
      }),
      catchError((err) => {
        this.logger.error(`verify => ${err.message}`);
        throw new BadRequestException({
          message: 'Invalid email or code',
          code: 'LOGIN_INVALID_EMAIL_OR_CODE',
        });
      }),
    );
  }

  // reset password
  async reset(email: string, code: number, password: string) {
    const user = await this.getUserByEmail(email);
    if (!user || user.password_code !== code) {
      throw new BadRequestException({
        message: 'invalid password code',
        code: 'RESET_CODE_INVALID',
      });
    }
    const is_psw_valid = await bcrypt.compare(password, user.password || '');
    if (is_psw_valid) {
      throw new BadRequestException({
        message: 'You trying to set your old password',
        code: 'RESET_SAME_PASSWORD',
      });
    }
    const _password_hash = await bcrypt.hash(
      password,
      this.authService.SALT_ROUNDS,
    );
    await this.updateUser(user.id, {
      password: _password_hash,
      password_code: null,
    });

    await this.revoke(user.id);

    return { message: 'Password is changed', code: 'PASSWORD_IS_CHANGED' };
  }

  // restore email
  async restore(email: string) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new BadRequestException({
        message: 'Invalid email',
        code: 'RESTORE_EMAIL_INVALID',
      });
    }
    const password_code = this.authService._getRandomArbitrary();
    await this.updateUser(user.id, { password_code });
    // TODO extract text strings
    await this.mailService.send({
      from: this.secretManagerService.configService.get('MAIL_SENDER'),
      to: user.email,
      subject: `Game Trade Market Password restore code is ${password_code}`,
      templateName: TemplateEnum.TMP_RESTORE_PASSWORD,
      params: {
        email: user.email,
        code: password_code,
      },
    });
    return { message: 'Code is sent', code: 'CODE_IS_SENT' };
  }

  // google auth
  async token(
    token: string,
    locale: string,
    referrerLink?: string,
    invitedBy?: string,
  ): Promise<{
    access_token: string;
    access_expires: Date;
    refresh_token: string;
    refresh_expires: Date;
  }> {
    const user = await this.authService.verifyGoogle(token);

    if (!user) {
      throw new BadRequestException({
        message: 'Invalid token',
        code: 'TOKEN_INVALID',
      });
    }

    let account = await this.getUserByEmail(user.email);

    const verifyPromoCode = await lastValueFrom(
      this.checkExisingPromoCode(invitedBy),
    );

    const payload = {
      email: user.email,
      google_sub: user.sub,
      locale: user.locale || locale,
      email_verified: user.email_verified,
      nick_name: user.name,
      image_url: user.picture,
      referrerLink,
      invitedBy: verifyPromoCode ? invitedBy : '',
    };

    if (account) {
      await this.addVisit(account.id);

      if (account.image_url) {
        delete payload.image_url;
      }

      if (account.locale) {
        delete payload.locale;
      }

      if (account.nick_name) {
        delete payload.nick_name;
      }

      await this.updateUser(account.id, payload);
    } else {
      account = await this.createUser(payload);
    }

    const { access_token, access_expires } =
      this.authService._createAccessToken({
        sub: account.id,
        ver: account.version,
      });
    const { refresh_token, refresh_expires } =
      await this.authService._createRefreshToken(account.id, {
        ver: account.version,
      });

    await lastValueFrom(this.setPromoCode(account.email));

    await this.setSessionToken(account.id, refresh_token);
    return {
      access_token,
      access_expires,
      refresh_token,
      refresh_expires,
    };
  }

  async revoke(user_id: string): Promise<Success> {
    await this.accountRepository.update(
      { id: user_id },
      { version: () => 'uuid_generate_v4()' },
    );
    return {
      message: 'Revoke token success',
      code: 'REVOKE_TOKEN_SUCCESS',
    };
  }

  async logout(user_id: string): Promise<Success> {
    await this.accountSessionRepository.delete({ user_id });
    return {
      message: 'Logout success',
      code: 'LOGOUT_SUCCESS',
    };
  }

  async access(
    admin: string,
    email?: string,
    id?: string,
  ): Promise<{ access_token: string; access_expires: Date }> {
    let account: AccountEntity;

    if (email) {
      account = await this.getUserByEmail(email);
    } else if (id) {
      account = await this.getUserById(id);
    }

    if (!account) {
      throw new BadRequestException({
        message: 'Invalid login',
        code: 'LOGIN_INVALID_ACCOUNT',
      });
    }

    const { access_expires, access_token } =
      this.authService._createAccessToken({
        sub: account.id,
        act: {
          sub: admin,
        },
        ver: account.version,
      });

    return {
      access_token,
      access_expires,
    };
  }

  async getReviewCount(review: ReviewEntity): Promise<number> {
    return this.reviewRepository.count({
      where: {
        user_id: review.id,
      },
    });
  }
}
