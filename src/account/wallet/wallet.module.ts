import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { WalletResolver } from './wallet.resolver';
import { WalletEntity } from './models/wallet.entity';
import { AuthModule } from '../../auth/auth.module';
import { BalanceService } from './balance.service';
import { BlockchainModule } from '../../blockchain/blockchain.module';
import { AccountModule } from '../account.module';
import { SourceCurrencyEntity } from '../../source/models/source-currency.entity';

@Module({
  imports: [
    AuthModule,
    BlockchainModule,
    forwardRef(() => AccountModule),
    TypeOrmModule.forFeature([WalletEntity, SourceCurrencyEntity]),
  ],
  providers: [WalletService, BalanceService, WalletResolver],
  exports: [WalletService, BalanceService],
})
export class WalletModule {}
