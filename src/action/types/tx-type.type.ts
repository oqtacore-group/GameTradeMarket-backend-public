import { TxTypeEnum } from '../enums';
import { ValueOf } from '../../helpers';

export type TxType = ValueOf<typeof TxTypeEnum>;
