import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Remove contract' })
export class ContractRemoveInput {
  @Field(() => String, { description: 'Contract ID' })
  contract_id: string;
}
