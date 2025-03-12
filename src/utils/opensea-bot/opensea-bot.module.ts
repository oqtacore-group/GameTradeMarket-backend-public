import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenseaBotService } from './opensea-bot.service';
import { SecretManagerModule } from '../secret-manager/secret-manager.module';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryEntity } from '../../inventory/models/inventory.entity';

@Module({
  imports: [
    ConfigModule,
    SecretManagerModule,
    HttpModule,
    TypeOrmModule.forFeature([InventoryEntity]),
  ],
  providers: [OpenseaBotService],
  exports: [OpenseaBotService],
})
export class OpenseaBotModule {}
