import { Asset, Order } from '@imtbl/core-sdk';
import { isNumber } from 'class-validator';
import { SaleType } from '../../inventory/models/inventory.entity';

export const assetMapFn = (asset: Asset, order?: Order) => {
  let price = null;
  let fee = null;
  if (order?.buy) {
    const { quantity_with_fees, quantity } = order?.buy.data;
    price = +quantity_with_fees;
    fee = +quantity_with_fees - +quantity;
  }
  return {
    token_value: asset.token_id,
    contract: asset.token_address,
    wallet: asset.user,
    platform: 'IMX',
    token_uri: asset.uri || '',
    approved: isNumber(order?.order_id),
    saleType: SaleType.FIXED_PRICE,
    fee,
    price,
    coin_address: '0x0000000000000000000000000000000000000000',
    imxOrderId: order?.order_id || null,
    attributes: {
      name: asset.name,
      description: asset.description,
      picture: asset.image_url,
      external_url: asset.uri,
    },
  };
};
