import { Query, Resolver } from '@nestjs/graphql';
import { BlockchainService } from './blockchain.service';
import { NetworkEntity } from './models/network.entity';

@Resolver(() => NetworkEntity)
export class BlockchainResolver {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Query(() => [NetworkEntity])
  async networks() {
    return await this.blockchainService.getNetworks();
  }
}
