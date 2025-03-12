import { Field, ObjectType, Int, ID, Float } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

export class GetGamesWithNotExistsTokens {}

@ObjectType()
export class ImportItemDto {
  @Field(() => Boolean)
  status: boolean;
  @Field(() => String, { nullable: true })
  message?: string;
}

@ObjectType()
export class ImportContractDto {
  @Field(() => Boolean)
  status: boolean;
  @Field(() => String, { nullable: true })
  message?: string;
}

@ObjectType()
export class DeleteGameItemDto {
  @Field(() => Boolean)
  status: boolean;
}

@ObjectType()
export class GetGameItemsDto {
  @Field(() => String, { nullable: true })
  node: string;
}

@ObjectType()
export class GetGameItemEdges {
  @Field(() => [GetGameItem], { nullable: true })
  @ApiProperty({ description: 'Items', required: false })
  node?: GetGameItem[];
}

@ObjectType()
export class GetGameItemDto {
  @Field(() => Int)
  totalCount: number;
  @Field(() => GetGameItemEdges)
  edges: GetGameItemEdges;
}

@ObjectType()
export class GetGameItem {
  @Field(() => ID)
  id: number;
  @Field(() => String)
  @ApiProperty({ description: 'Token identity' })
  token_value: string;
  @Field(() => String)
  @ApiProperty({ description: 'Address smart contract' })
  contract: string;
  @Field(() => String)
  @ApiProperty({ description: 'Blockchain' })
  blockchain: string;
  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Token price', required: false })
  price?: number;
}

@ObjectType()
export class UserWallet {
  @Field(() => String, { nullable: true })
  address: string;
}

@ObjectType()
export class UserWallets {
  @Field(() => [UserWallet], { nullable: true })
  user_addresses: UserWallet[];
}

@ObjectType()
export class CreateUserDto {
  @Field(() => Boolean)
  status: boolean;
  @Field(() => String, { nullable: true })
  message?: string;
}

@ObjectType()
export class GameCardMint {
  @Field(() => String)
  title: string;
  @Field(() => String)
  game_code: string;
  @Field(() => String)
  description: string;
  @Field(() => String, { nullable: true })
  utility?: string;
  @Field(() => String)
  contract: string;
  @Field(() => String)
  blockchain: string;
  @Field(() => [MediaLinks])
  media: MediaLinks[];
  @Field(() => Date, { nullable: true })
  start_mint: Date;
  @Field(() => String)
  start_price: string;
  @Field(() => Number)
  usd_price?: number;
  @Field(() => Number)
  amount_items: number;
  @Field(() => [RoadMapData])
  roadmap: RoadMapData[];
}

@ObjectType()
export class MediaLinks {
  @Field(() => String)
  type: string;
  @Field(() => String)
  link: string;
}

@ObjectType()
export class RoadMapData {
  @Field(() => String)
  quarter: string;
  @Field(() => String)
  date: string;
  @Field(() => [RoadLMapListData])
  list: RoadLMapListData[];
}

@ObjectType()
export class RoadLMapListData {
  @Field(() => Boolean)
  completed: boolean;
  @Field(() => String)
  value: string;
}
