import { BaseProvider, IItem, IOptions } from './base.provider';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Nullable } from '../utils/interfaces/utils.interface';
import { CardProp, DisplayType } from '../inventory/interfaces/card.interface';

export class OpenSeaProvider extends BaseProvider {
  readonly httpService: HttpService;
  constructor() {
    super();
    this.httpService = new HttpService();
  }

  async get({ asset_contract, id }: IOptions): Promise<Nullable<IItem>> {
    const response = await lastValueFrom(
      this.httpService.get('https://api.opensea.io/api/v1/assets', {
        headers: {
          'X-API-KEY': process.env.OPENSEA_API_KEY,
        },
        params: {
          asset_contract_address: asset_contract,
          include_orders: true,
          token_ids: id,
        },
      }),
    );
    if (!response?.data?.assets) return null;
    const asset = response.data.assets[0] as {
      traits: CardProp[];
      sell_orders: { current_price: string }[];
      asset_contract: { address: string };
      owner: { address: string };
      token_id: string;
      token_metadata: string;
      name: string;
      description: string;
      image_original_url: string;
    };

    if (!asset) return null;

    const attributes = asset.traits?.map((trait) => ({
      trait_type: trait.trait_type,
      display_type: trait.display_type || DisplayType.string,
      value: trait.value,
      max_value: trait.max_value,
      trait_count: trait.trait_count,
      order: trait.order,
      max_count: trait.max_count,
    }));

    let _price = 0;
    if (asset.sell_orders) {
      _price = +asset.sell_orders[0].current_price;
    }
    return {
      contract: asset.asset_contract?.address,
      token_value: asset.token_id,
      approved: !!_price,
      wallet: asset.owner?.address,
      price: _price,
      token_uri: asset.token_metadata,
      attributes: {
        name: asset.name,
        description: asset.description,
        picture: asset.image_original_url,
        attributes,
      },
    };
  }
}
