import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockchainService } from '../../blockchain/blockchain.service';
import Web3 from 'web3';
import { IGetNetwork } from '../../blockchain/interfaces/blockchain.interface';
import { Nullable } from '../../utils/interfaces/utils.interface';
import { Currency } from './dto/currency.dto';
import { SourceCurrencyEntity } from '../../source/models/source-currency.entity';
import { isObject } from 'class-validator';

@Injectable()
export class BalanceService {
  private readonly logger = new Logger(BalanceService.name);
  ETHEREUM_COIN_CONTRACT = '0x0000000000000000000000000000000000000000';

  constructor(
    private readonly blockchainService: BlockchainService,
    @InjectRepository(SourceCurrencyEntity)
    private readonly sourceCurrencyRepository: Repository<SourceCurrencyEntity>,
  ) {}

  private async _getKnownBalances(): Promise<IGetNetwork[]> {
    const data = await this.sourceCurrencyRepository.find({
      relations: ['coin', 'coin.network'],
      where: {
        coin: {
          network: {
            is_enabled: true,
          },
        },
      },
    });
    const result = [];
    data.map((sourceCurrency) => {
      if (
        result.filter((v) => {
          return v.contract == sourceCurrency?.coin?.contract;
        }).length === 0
      ) {
        if (sourceCurrency.coin) {
          result.push({
            currency: sourceCurrency.coin.symbol,
            code: sourceCurrency.coin.network.code,
            decimals: sourceCurrency.coin.decimals,
            name: sourceCurrency.coin.name,
            contract: sourceCurrency.coin.contract,
            wb: new Web3(sourceCurrency.coin.network.rpc_url),
          });
        }
      }
    });

    return result;
  }

  private async _getBalance(
    addresses: string[],
    network: IGetNetwork,
  ): Promise<Nullable<Currency[]>> {
    if (!network && !network.wb) return null;
    const { currency, name, code, wb, decimals } = network;

    return Promise.all(
      addresses.map(async (address) => {
        const value = await wb.eth.getBalance(address);
        return {
          value,
          currency,
          decimals,
          name,
          contract: this.ETHEREUM_COIN_CONTRACT,
          blockchain: code,
        };
      }),
    );
  }

  private async _hashCoinBalance(
    addresses: string[],
    networks: IGetNetwork[],
  ): Promise<Currency[]> {
    const response = await Promise.allSettled(
      networks.map((network) => this._getBalance(addresses, network)),
    );

    return response.reduce((pr, cur) => {
      if (cur.status !== 'rejected') {
        cur.value.map((v) => pr.push(v));
      }
      return pr;
    }, []);
  }

  private async _hashBalance(
    addresses: string[],
    networks: IGetNetwork[],
  ): Promise<Currency[]> {
    const response = await Promise.all(
      networks.map((network) => this._balanceOf(addresses, network)),
    );
    return response.filter(Boolean).reduce((pr, cur) => {
      cur.map((v) => pr.push(v));
      return pr;
    }, []);
  }

  async _balanceOf(
    addresses: string[],
    network: IGetNetwork,
  ): Promise<Nullable<Currency[]>> {
    if (!isObject(network)) return [];
    const { currency, name, code, wb, contract, decimals } = network;
    const wbContract = new wb.eth.Contract(
      [
        {
          constant: true,
          inputs: [{ name: '_owner', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: 'balance', type: 'uint256' }],
          payable: false,
          stateMutability: 'view',
          type: 'function',
        },
      ],
      contract,
    );
    return Promise.all(
      addresses.map(async (address) => {
        try {
          const value = await wbContract.methods['balanceOf'](address).call();
          return {
            currency,
            name,
            decimals,
            contract,
            blockchain: code,
            value,
          };
        } catch (err) {
          this.logger.error(err.message);
          return null;
        }
      }),
    );
  }

  async getBalances(addresses: string[]): Promise<Currency[]> {
    if (!addresses.length) return [];
    const [networks, balances] = await Promise.all([
      this.blockchainService.getNetworks(),
      this._getKnownBalances(),
    ]);
    const [balances_data, balances_coin] = await Promise.all([
      this._hashBalance(addresses, balances),
      this._hashCoinBalance(addresses, networks),
    ]);
    return balances_data.concat(balances_coin).filter(Boolean);
  }
}
