import { ApiProperty } from '@nestjs/swagger';

export class PlayerWalletDto {
  @ApiProperty({ description: 'Address' })
  address: string;

  @ApiProperty({ description: 'Name wallet' })
  name: string;

  @ApiProperty({ description: 'Networks' })
  networks: string[];
}
