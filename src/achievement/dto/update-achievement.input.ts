import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAchievementInput {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Name of achievement', required: false })
  readonly name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Description of achievement', required: false })
  readonly description: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({ description: 'Link to achievement image', required: false })
  readonly image_url: string;

  @IsOptional()
  @IsInt()
  @ApiProperty({ description: 'Score of achievement', required: false })
  readonly score: number;
}
