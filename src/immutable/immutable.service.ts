import { Injectable } from '@nestjs/common';
import { Config, ImmutableX, Order } from '@imtbl/core-sdk';
import { forkJoin, from, Observable, of, switchMap } from 'rxjs';
import { InventoryEntity } from '../inventory/models/inventory.entity';
import { map } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isArray, isEthereumAddress } from 'class-validator';
import { assetMapFn, assetsMapFn } from './helpers';

@Injectable()
export class ImmutableService {
  readonly client: ImmutableX;

  constructor(
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepository: Repository<InventoryEntity>,
  ) {
    this.client = new ImmutableX(Config.PRODUCTION);
  }

  getUserNfts(address: string) {
    if (!isEthereumAddress(address)) {
      return of([]);
    }
    return from(this.client.listAssets({ user: address })).pipe(
      switchMap((listAssetsResponse) =>
        of(assetsMapFn(listAssetsResponse.result)),
      ),
    );
  }

  getActiveOrder(address: string, tokenValue: string): Observable<Order> {
    return from(
      this.client.listOrders({
        sellTokenId: tokenValue,
        sellTokenAddress: address,
        status: 'active',
      }),
    ).pipe(
      switchMap((listOrdersResponse) => {
        if (
          isArray(listOrdersResponse.result) &&
          listOrdersResponse.result.length > 0
        ) {
          return of(listOrdersResponse.result[0]);
        }
        return of(null);
      }),
    );
  }

  getNft(address: string, tokenValue: string) {
    if (!isEthereumAddress(address)) {
      return of(null);
    }
    return forkJoin([
      this.client.getAsset({ tokenAddress: address, tokenId: tokenValue }),
      this.getActiveOrder(address, tokenValue),
    ]).pipe(map(([asset, order]) => assetMapFn(asset, order)));
  }
}
