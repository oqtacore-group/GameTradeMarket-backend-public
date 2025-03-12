import { IsInt, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAchievementInput {
  @IsString()
  @ApiProperty({ description: 'Name of achievement' })
  readonly name: string;

  @IsString()
  @ApiProperty({ description: 'Game identity of achievement' })
  readonly game_code: string;

  @IsString()
  @ApiProperty({ description: 'Description of achievement' })
  readonly description: string;

  @IsUrl()
  @ApiProperty({ description: 'Link to achievement image' })
  readonly image_url: string;

  @IsInt()
  @ApiProperty({ description: 'Score of achievement' })
  readonly score: number;
}
