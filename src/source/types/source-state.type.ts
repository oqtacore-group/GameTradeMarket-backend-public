import { registerEnumType } from '@nestjs/graphql';

export type SourceStateType = 'Beta' | 'Live' | 'Development';

export enum SourceStateTypeEnum {
  ALPHA = 'Alpha',
  BETA = 'Beta',
  LIVE = 'Live',
  DEVELOPMENT = 'Development',
  PRESALE = 'Presale',
}

registerEnumType(SourceStateTypeEnum, { name: 'SourceStateType' });
