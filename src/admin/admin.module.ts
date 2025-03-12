import { Module } from '@nestjs/common';

import { AdminService } from './admin.service';
import { AccountModule } from '../account/account.module';
import { InventoryModule } from '../inventory/inventory.module';
import { AdminResolver } from './admin.resolver';
import { AuthModule } from '../auth/auth.module';
import { ListingModule } from '../inventory/listings/listing.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemTransactionEntity } from '../inventory/models/item-transaction.entity';
import { NetworkEntity } from '../blockchain/models/network.entity';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { InventoryEntity } from '../inventory/models/inventory.entity';

@Module({
  imports: [
    AuthModule,
    AccountModule,
    BlockchainModule,
    InventoryModule,
    ListingModule,
    TypeOrmModule.forFeature([
      ItemTransactionEntity,
      NetworkEntity,
      InventoryEntity,
    ]),
  ],
  providers: [AdminService, AdminResolver],
  exports: [AdminService],
})
export class AdminModule {}
