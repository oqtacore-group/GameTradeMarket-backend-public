import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ContractEntity } from './models/contract.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockchainService } from '../blockchain/blockchain.service';
import { TokenDataAttrs } from '../blockchain/dto/token-info.dto';
import { Nullable } from '../utils/interfaces/utils.interface';
import { GetGamesWithNotExistsTokenDto } from '../integration/dto/get-games-with-not-exists-token.dto';

@Injectable()
export class ContractService {
  private logger = new Logger(ContractService.name);

  constructor(
    readonly blockchainService: BlockchainService,
    @InjectRepository(ContractEntity)
    private readonly contractRepository: Repository<ContractEntity>,
  ) {}

  getContractById(contract: string): Promise<Nullable<ContractEntity>> {
    if (!contract) return null;
    return this.contractRepository.findOne({
      relations: ['network'],
      where: { contract },
    });
  }

  async getContractsBySource(source: string): Promise<ContractEntity[]> {
    if (!source) return [];
    return this.contractRepository.find({
      where: { game_code: source },
    });
  }

  async formatter(
    contract: string,
    token: string,
    tokenData: TokenDataAttrs,
  ): Promise<any> {
    const data = await this.getContractById(contract);
    if (!data) return null;
    const mapping = data.mapping;
    const attributes = {};
    const tokenKeys = Object.keys(tokenData);
    for (const key of tokenKeys) {
      const mKey = mapping[key] ?? key;
      attributes[mKey] = tokenData[key];
    }

    return { ...data, attributes };
  }

  async getGamesWithNotExistsTokens(): Promise<
    GetGamesWithNotExistsTokenDto[]
  > {
    const result = await this.contractRepository.query(`
       select c.contract, c.blockchain from inventory.contracts c 
       where not exists (select 1 from inventory.items i where i.contract = c.contract limit 1)
    `);

    return result.map((v) => ({
      contract: v.contract,
      blockchain: v.blockchain,
    }));
  }
}
