import { ArgsType, Field, ID, InterfaceType } from '@nestjs/graphql';

@InterfaceType()
export class FileMetaData {
  @Field(() => String)
  etag: string;
  @Field(() => String)
  key: string;
  @Field(() => String)
  bucket: string;
}

@ArgsType()
export class ChatSendTextArgs {
  @Field(() => ID)
  recipient: string;
  @Field(() => String)
  context: string;
}

@ArgsType()
export class ChatSendMediaArgs {
  @Field(() => ID)
  recipient: string;
  @Field(() => String)
  context: string;
}
