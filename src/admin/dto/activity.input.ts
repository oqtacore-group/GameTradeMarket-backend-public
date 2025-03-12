import { PaginationParams } from '../../utils/interfaces/utils.interface';
import { InputType } from '@nestjs/graphql';

@InputType()
export class ActivityInput extends PaginationParams {}
