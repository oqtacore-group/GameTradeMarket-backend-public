import { Module } from '@nestjs/common';
import { ImmutableService } from './immutable.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryEntity } from '../inventory/models/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryEntity])],
  providers: [ImmutableService],
  exports: [ImmutableService],
})
export class ImmutableModule {}
