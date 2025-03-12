import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkEntity } from './models/network.entity';
import { BlockchainResolver } from './blockchain.resolver';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([NetworkEntity]), HttpModule],
  providers: [BlockchainService, BlockchainResolver],
  exports: [BlockchainService],
})
export class BlockchainModule {}
