import { AssetWithOrders } from '@imtbl/core-sdk';

export const assetsMapFn = (assets: AssetWithOrders[]) => {
  return assets.map((asset) => ({
    token_value: asset.token_id,
    contract: asset.token_address,
    wallet: asset.user,
    platform: 'IMX',
    attributes: {
      name: asset.name,
      description: asset.description,
      picture: asset.image_url,
      external_url: asset.uri,
    },
  }));
};
