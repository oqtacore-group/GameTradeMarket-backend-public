import {
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export type Nullable<T> = null | T;

export interface IDatabase {
  username: string;
  password: string;
  host: string;
  port: string;
  dbname: string;
  engine: 'postgres';
}

export interface IElasticConfig {
  node: string;
  index: string;
  auth: {
    username: string;
    password: string;
  };
}

export enum SortValues {
  ASC = 'ASC',
  DESC = 'DESC',
}

export const enum Environment {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
}

registerEnumType(SortValues, { name: 'SortValues' });

@ObjectType()
export class PageInfo {
  @Field(() => Boolean)
  @ApiProperty({ description: 'Has next page', required: true })
  hasNextPage: boolean;
}

@ObjectType()
export class LoopbackResult {
  @Field(() => String)
  event: string;
}

@InputType()
export class PaginationParams {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Field(() => Int, { defaultValue: 20 })
  @ApiProperty({ description: 'Limit records', required: false })
  readonly first?: number = 20;
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Field(() => Int, { defaultValue: 0 })
  @ApiProperty({ description: 'Offset records', required: false })
  readonly offset?: number = 0;
}

export const CookieGQl = createParamDecorator(
  (_name: string, context: ExecutionContext): Response => {
    const _cookies = GqlExecutionContext.create(context).getContext().cookies;
    return _name ? _cookies[_name] : _cookies;
  },
);

export const ResGQl = createParamDecorator(
  (_: unknown, context: ExecutionContext): Response =>
    GqlExecutionContext.create(context).getContext().response,
);
