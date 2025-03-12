import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WalletEntity } from './models/wallet.entity';
import { WalletFilters } from './interfaces/wallet.input';

@Injectable()
export class WalletService {
  private logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
  ) {}

  async myWallets(user_id: string, custom_url?: string) {
    const condition = custom_url ? { user: { custom_url } } : { user_id };
    return this.walletRepository.find({
      relations: ['user'],
      where: { ...condition },
    });
  }

  async getWallets({ offset, first }: WalletFilters) {
    return this.walletRepository.find({
      skip: offset,
      take: first,
      order: { id: 'ASC' },
    });
  }

  async getWalletsCount(): Promise<number> {
    return this.walletRepository.count();
  }

  async getWalletByUserIdAndAddress(
    user_id: string,
    address: string,
  ): Promise<WalletEntity> {
    return this.walletRepository.findOne({ where: { user_id, address } });
  }

  async updateWallet({
    user_id,
    name,
    address,
  }: WalletEntity): Promise<WalletEntity> {
    await this.walletRepository.update({ user_id, address }, { name });
    return this.walletRepository.findOne({ where: { user_id, address } });
  }

  async connect(payload: WalletEntity) {
    const wallet = await this.walletRepository.findOne({
      where: {
        address: payload.address,
      },
    });
    if (wallet) {
      return {
        message: 'Wallet already connected',
        code: 'WALLET_ALREADY_CONNECTED',
      };
    }
    await this.walletRepository.insert(payload);
    return {
      message: 'Wallet connected',
      code: 'WALLET_CONNECTED',
    };
  }

  async disconnect(user_id: string, address: string) {
    await this.walletRepository.delete({
      address,
      user_id,
    });
    return {
      message: 'Wallet deleted',
      code: 'WALLET_DELETED',
    };
  }
}
