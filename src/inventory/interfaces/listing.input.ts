import { Field, InputType } from '@nestjs/graphql';
import { PaginationParams } from '../../utils/interfaces/utils.interface';

@InputType()
export class ListingFilters extends PaginationParams {
  @Field(() => String, { nullable: true })
  create_date_from?: string;
}
