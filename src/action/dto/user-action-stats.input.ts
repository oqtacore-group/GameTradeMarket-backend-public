import { IsUUID } from 'class-validator';
import { InputType } from '@nestjs/graphql';

@InputType()
export class UserActionStatsInput {
  @IsUUID()
  userId?: string;
}
