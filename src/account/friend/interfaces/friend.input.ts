import { InputType } from '@nestjs/graphql';
import { PaginationParams } from '../../../utils/interfaces/utils.interface';

@InputType()
export class FriendParams extends PaginationParams {}
