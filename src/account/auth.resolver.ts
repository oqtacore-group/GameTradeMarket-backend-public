import {
  Args,
  ID,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AccountService } from './account.service';
import { AccountEntity } from './models/account.entity';
import {
  CookieGQl,
  Environment,
  ResGQl,
} from '../utils/interfaces/utils.interface';
import { Response } from 'express';
import { LoginParams, SignupParams } from '../auth/interfaces/sign-in.input';
import { VerifyParams } from '../auth/interfaces/verify.input';
import { RestoreParams } from '../auth/interfaces/restore.input';
import { ResetParams } from '../auth/interfaces/reset.input';
import { Token } from '../auth/dto/token.dto';
import { Success } from '../utils/interfaces/response.interface';
import { PREFIX_APP } from '../utils/constants';
import { CurrentUserRoles, RoleEnum } from '../role/role.decorator';
import { ReviewEntity } from '../review/models/review.entity';
import { ReviewOwnerDto } from '../review/dto/review.dto';

const COOKIE_REFRESH_TOKEN_NAME = 'X-Refresh-Token';

@Resolver(() => AccountEntity)
export class AuthResolver {
  constructor(private readonly accountService: AccountService) {}

  private setCookieRefreshToken(
    token: string,
    expires: Date,
    response: Response,
  ) {
    const is_develop =
      this.accountService.secretManagerService.configService.get('NODE_ENV') ===
      Environment.DEVELOPMENT;
    response.cookie(COOKIE_REFRESH_TOKEN_NAME, token, {
      sameSite: is_develop ? 'none' : 'strict',
      path: PREFIX_APP,
      httpOnly: true,
      expires: expires,
      secure: true,
    });
  }

  @Query(() => Token)
  async login(
    @Args('params') { email, password }: LoginParams,
    @ResGQl() response: Response,
  ) {
    const { access_token, refresh_token, refresh_expires, access_expires } =
      await this.accountService.signIn(email, password);
    this.setCookieRefreshToken(refresh_token, refresh_expires, response);
    return { token: access_token, expires: access_expires };
  }

  @Query(() => Token)
  async refresh(@CookieGQl(COOKIE_REFRESH_TOKEN_NAME) cookie: string) {
    const { access_token, access_expires } = await this.accountService.refresh(
      cookie,
    );
    return { token: access_token, expires: access_expires };
  }

  @Mutation(() => Success)
  signup(@Args('params') params: SignupParams) {
    return this.accountService.signUp(params);
  }

  @Mutation(() => Token)
  async token(
    @Args('token') _token: string,
    @Args('locale', { nullable: true, defaultValue: 'en' }) locale: string,
    @Args('invitedBy', { nullable: true }) invitedBy: string,
    @Args('referrerLink', { nullable: true, defaultValue: 'direct link' })
    referrerLink: string,
    @ResGQl() response: Response,
  ) {
    const { access_token, access_expires, refresh_token, refresh_expires } =
      await this.accountService.token(_token, locale, referrerLink, invitedBy);
    this.setCookieRefreshToken(refresh_token, refresh_expires, response);
    return { token: access_token, expires: access_expires };
  }

  @Mutation(() => Success, {
    description: 'Email verification',
  })
  verify(@Args('params') { email, code }: VerifyParams) {
    return this.accountService.verify(email, code);
  }

  @Mutation(() => Success)
  restore(@Args('params') { email }: RestoreParams) {
    return this.accountService.restore(email);
  }

  @Mutation(() => Success)
  reset(@Args('params') { email, code, password }: ResetParams) {
    return this.accountService.reset(email, code, password);
  }

  @Mutation(() => Success)
  @CurrentUserRoles(RoleEnum.ADMIN)
  revoke(@Args('user_id', { type: () => ID }) user_id: string) {
    return this.accountService.revoke(user_id);
  }
}

@Resolver(() => ReviewOwnerDto)
export class ReviewOwnerDtoResolver {
  constructor(private readonly accountService: AccountService) {}

  @ResolveField(() => Int)
  review_count(@Parent() review: ReviewEntity) {
    return this.accountService.getReviewCount(review);
  }
}
