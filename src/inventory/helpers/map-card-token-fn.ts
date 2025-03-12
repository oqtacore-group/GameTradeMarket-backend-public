import { Card, CardItem } from '../interfaces/card.interface';
import { InventoryEntity } from '../models/inventory.entity';
import { fromWei } from 'web3-utils';
import { mapPropFn } from './map-prop-fn';
import { mapLevelFn } from './map-level-fn';
import { CoinInfoEntity } from '../../source/models/coin-info.entity';

export const mapCardToken = (item: InventoryEntity): CardItem => {
  const price = item.price ? Number(fromWei(item.price.toString())) : 0;
  return {
    id: item.id,
    contract: item.contract,
    owner: item.wallet,
    token_value: item.token_value,
    price: price ?? null,
    blockchain: item.contractData?.blockchain,
    platform: item.platform,
  };
};

export const mapCardTokenFn = (
  item: InventoryEntity,
  coin_info?: CoinInfoEntity,
): Card => {
  let price;
  const isFloatPrice = item?.price?.toString()?.includes('.');
  if (!isFloatPrice) {
    price =
      item?.price && coin_info?.decimals
        ? Number(item.price) * Math.pow(10, -coin_info?.decimals)
        : Number(item?.price)
        ? Number(item?.price) * Math.pow(10, -18)
        : null;
  } else {
    price = item?.price;
  }
  const response = {
    id: item.id,
    contract: item.contract,
    owner: item.wallet,
    coin_address: coin_info?.contract
      ? coin_info?.contract
      : item?.coin_address
      ? item?.coin_address
      : '0x0000000000000000000000000000000000000000',
    coin_info: coin_info
      ? {
          symbol: coin_info?.symbol,
          decimals: coin_info?.decimals,
          coin_address: coin_info?.contract,
          logo: coin_info?.thumbnail_url,
          blockchain: coin_info?.blockchain,
          price:
            price && Number(price).toFixed(5)
              ? Number(Number(price).toFixed(5))
              : 0,
          usd_price:
            price && coin_info?.price
              ? Number(
                  (
                    item?.price *
                    Math.pow(10, -coin_info?.decimals) *
                    coin_info?.price
                  ).toFixed(2),
                )
              : 0,
          usd_price_per_coin: coin_info?.price ?? 0,
        }
      : null,
    game_code: item.contractData?.game_code,
    game_name: item.contractData?.source?.name ?? item.contractData?.game_code,
    trade_contract_opensea: '0x436CEb97d2d79DDaa67d0F9045108A9BaC8b26d9',
    trade_contract_gametrade: item.contractData?.network?.trade_contract,
    token_value: item.token_value,
    name: item.attributes?.name,
    description: item.attributes?.description,
    price:
      price && Number(price).toFixed(5) ? Number(Number(price).toFixed(5)) : 0,
    picture: item.picture_url ?? item.attributes?.picture,
    blockchain: item.contractData?.blockchain
      ? item.contractData.blockchain
      : item.blockchain,
    token_uri: item.token_uri,
    platform: item.platform,
    token_url: item?.attributes?.token_url,
    is_external_item: Boolean(item.attributes?.token_url),
    token_tx_data: item?.attributes?.token_tx_data,
    animation_url: item?.attributes?.animation_url,
    props: mapPropFn(item.attributes),
    levels: mapLevelFn(item.attributes),
    approved: item.approved,
    imxOrderId: item.imxOrderId,
    item_data: item.item_data ?? null,
  };
  return response;
};
