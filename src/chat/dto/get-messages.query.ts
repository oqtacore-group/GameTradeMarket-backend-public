import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetMessagesQuery {
  @IsUUID(4)
  friendId: string;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Transform(({ value }) => parseInt(value))
  limit: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  offset: number;
}
