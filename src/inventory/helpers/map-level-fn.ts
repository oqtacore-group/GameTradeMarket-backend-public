import { CardLevel } from '../interfaces/card.interface';
import { TokenDataAttrs } from '../../blockchain/dto/token-info.dto';
import { isArray } from 'class-validator';

export const mapLevelFn = (data: TokenDataAttrs): CardLevel[] => {
  if (!isArray(data?.attributes)) {
    return [];
  }

  return data.attributes
    .filter(
      (attr: CardLevel) =>
        ['boost_number', 'number'].includes(attr.display_type) &&
        !Array.isArray(attr.value) &&
        typeof attr.value !== 'undefined',
    )
    .map((attr) => ({ ...attr, value: JSON.stringify(attr.value) }));
};
