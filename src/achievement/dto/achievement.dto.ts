import { ApiDefaultResponse, ApiProperty } from '@nestjs/swagger';

@ApiDefaultResponse()
export class AchievementDto {
  @ApiProperty({ description: 'Identity achievement' })
  id: number;
  @ApiProperty({ description: 'Name of achievement' })
  name: string;
  @ApiProperty({ description: 'Description of achievement' })
  description: string;
  @ApiProperty({ description: 'Link to achievement image' })
  image_url: string;
  @ApiProperty({ description: 'Score of achievement' })
  score: number;
  @ApiProperty({ description: 'Total achievements' })
  total?: number;
}
