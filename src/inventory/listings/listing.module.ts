import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ListingService } from './listing.service';
import { ListingEntity } from './models/listing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ListingEntity])],
  providers: [ListingService],
  exports: [ListingService],
})
export class ListingModule {}
