import { Injectable } from '@nestjs/common';
import { Repository, MoreThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ListingEntity } from './models/listing.entity';
import { ListingFilters } from './interfaces/listing.input';

@Injectable()
export class ListingService {
  constructor(
    @InjectRepository(ListingEntity)
    private readonly listingRepository: Repository<ListingEntity>,
  ) {}

  async getListings({ create_date_from }: ListingFilters): Promise<number> {
    const whereConditions: any = {
      is_listing: true,
    };

    if (create_date_from) {
      whereConditions.create_time = MoreThan(create_date_from);
    }

    return this.listingRepository.count({
      where: whereConditions,
    });
  }
}
