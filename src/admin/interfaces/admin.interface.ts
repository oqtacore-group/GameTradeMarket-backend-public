import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { PaginationParams } from '../../utils/interfaces/utils.interface';

@ObjectType({ description: 'Statistics' })
export class TableResponse {
  @Field(() => String, { description: 'Name of entity' })
  value: string;

  @Field(() => Number, { description: 'Count for all time' })
  allTime: number;

  @Field(() => Number, { description: 'Count for 24 hours' })
  for24hours: number;

  @Field(() => Number, { description: 'Count for 30 days' })
  for30days: number;

  @Field(() => String, {
    description: 'First-time actions (if available)',
    nullable: true,
  })
  onlyFirstTime24hours: string;
}

@ObjectType()
export class BlockchainChartResponse {
  @Field(() => String, { description: 'Blockchain name' })
  blockchain: string;

  @Field(() => String, {
    description: 'Count of contracts in selected blockchain',
  })
  count: string;
}

@ObjectType()
export class StatisticsResponse {
  @Field(() => [TableResponse], {
    description: 'Data for statistics table on Dashboard Page',
  })
  table: TableResponse[];

  @Field(() => [BlockchainChartResponse], {
    description: 'Data for blockchain chart',
  })
  blockchainsChart: BlockchainChartResponse;
}

//
// Game Items
//

@InputType()
export class GameItemsParams extends PaginationParams {
  @Field(() => String, { nullable: true })
  gameCode: string;
}

@ObjectType()
export class GameItemsResponse {
  @Field(() => Number, { description: 'ID', nullable: true })
  id: number;

  @Field(() => String, { description: 'Game item contract', nullable: true })
  contract: string;

  @Field(() => String, { description: 'Game item description', nullable: true })
  description: string;
}
