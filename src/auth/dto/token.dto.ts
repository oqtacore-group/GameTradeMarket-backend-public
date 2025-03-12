import { Field, HideField, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { AccountEntity } from '../../account/models/account.entity';

@ObjectType()
export class Token {
  @Field(() => String, {
    description: 'Authorization token',
  })
  @ApiProperty({ description: 'Token value' })
  token: string;

  @Field(() => String, {
    defaultValue: 'Bearer',
    description: 'Token type',
  })
  @ApiProperty({ description: 'Token type bearer' })
  token_type: string;

  @Field(() => Date, {
    description: 'Token expiration date',
  })
  @ApiProperty({ description: 'Token expires' })
  expires: Date;

  @HideField()
  user: {
    id: string;
    nick_name: string;
  };
}

export interface ITokens {
  access_token: string;
  access_expires: Date;
  refresh_token: string;
  refresh_expires: Date;
}

export interface IRefresh {
  access_token: string;
  access_expires: Date;
}
