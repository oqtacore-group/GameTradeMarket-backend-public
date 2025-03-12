import { CardProp } from '../interfaces/card.interface';
import { TokenDataAttrs } from '../../blockchain/dto/token-info.dto';
import { isArray } from 'class-validator';

export const mapPropFn = (data: TokenDataAttrs): CardProp[] => {
  if (!isArray(data?.attributes)) {
    return [];
  }

  return data.attributes
    .filter(
      (attr) =>
        attr.display_type === 'string' &&
        !Array.isArray(attr.value) &&
        typeof attr.value !== 'undefined',
    )
    .map((attr) => ({ ...attr, value: JSON.stringify(attr.value) }));
};
