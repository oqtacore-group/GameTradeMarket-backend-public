import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, In, Repository } from 'typeorm';
import { ChatEntity } from './models/chat.entity';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { FriendService } from '../account/friend/friend.service';
import { EventService } from '../event/event.service';
import { GetMessageDto, GetMessagesDto } from './dto';

@Injectable()
export class ChatService {
  readonly store: S3;

  constructor(
    private readonly friendService: FriendService,
    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,
    private readonly configService: ConfigService,
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
  ) {
    this.store = new S3();
  }

  async textSend(
    sender_id: string,
    recipient_id: string,
    context: string,
  ): Promise<GetMessageDto> {
    if (!context || !sender_id || !recipient_id) return;
    const sender = await this.friendService.myFriend(sender_id, recipient_id);

    if (sender) {
      const record = (
        await this.chatRepository
          .createQueryBuilder()
          .insert()
          .values({ sender_id, recipient_id, context: context.trim() })
          .returning(['id', 'context', 'is_media', 'create_time'])
          .execute()
      ).raw[0];

      this.eventService
        .sendNotifyAddMessageChat(
          sender.userFriend,
          sender.userOwner.nick_name,
          context.trim(),
          {
            senderId: sender_id,
            messageId: record.id,
          },
        )
        .then();

      return {
        id: record.id,
        author: sender_id,
        to: recipient_id,
        avatar: sender.userOwner.image_url,
        state: {
          is_media: record.is_media,
          is_read: record.is_read,
        },
        context: record.context,
        create_time: record.create_time,
      };
    }
  }

  private async addChatMessage(
    sender_id,
    recipient_id,
    location,
    key,
    bucket,
    etag,
  ) {
    return (
      await this.chatRepository
        .createQueryBuilder()
        .insert()
        .values({
          sender_id,
          recipient_id,
          is_media: true,
          context: location,
          meta_data: {
            key,
            bucket,
            etag,
          },
        })
        .returning(['id', 'context', 'is_media', 'is_read', 'create_time'])
        .execute()
    ).raw[0];
  }

  private static async getUnreadCount(
    sender_id: string,
    recipient_id: string,
  ): Promise<number> {
    return getManager()
      .createQueryBuilder(ChatEntity, 'c')
      .innerJoin('c.sender', 's')
      .where(
        `(c.sender_id = :recipient_id and c.recipient_id = :sender_id and c.is_read is false)`,
        { sender_id, recipient_id },
      )
      .getCount();
  }

  // async audioSend(sender_id: string, recipient_id: string, context: Buffer) {
  //   const friend = await this.friendService.myFriend(sender_id, recipient_id);
  //   if (friend) {
  //     const { Key, Bucket, ETag, Location } = await this.store
  //       .upload({
  //         Bucket: this.configService.get('AWS_MEDIA_BUCKET_NAME'),
  //         Body: context,
  //         Key: `audio/${uuid()}.ogg`,
  //       })
  //       .promise();
  //     const record = await this.addChatMessage(
  //       sender_id,
  //       recipient_id,
  //       Location,
  //       Key,
  //       Bucket,
  //       ETag,
  //     );
  //     return {
  //       id: record.id,
  //       author: sender_id,
  //       to: recipient_id,
  //       avatar: friend.userOwner.image_url,
  //       state: {
  //         is_media: record.is_media,
  //         is_read: record.is_read,
  //       },
  //       context: `${this.configService.get('AWS_DISTRIBUTION_MEDIA')}/${Key}`,
  //       create_time: record.create_time,
  //     };
  //   }
  // }

  async imageSend(sender_id: string, recipient_id: string, context: Buffer) {
    const friend = await this.friendService.myFriend(sender_id, recipient_id);
    if (friend) {
      const { Key, Bucket, ETag, Location } = await this.store
        .upload({
          Bucket: this.configService.get('AWS_MEDIA_BUCKET_NAME'),
          Body: context,
          Key: `audio/${uuid()}.jpeg`,
        })
        .promise();
      const record = await this.addChatMessage(
        sender_id,
        recipient_id,
        Location,
        Key,
        Bucket,
        ETag,
      );

      return {
        id: record.id,
        author: sender_id,
        to: recipient_id,
        avatar: friend.userOwner.image_url,
        state: {
          is_media: record.is_media,
          is_read: record.is_read,
        },
        context: `${this.configService.get('AWS_DISTRIBUTION_MEDIA')}/${Key}`,
        create_time: record.create_time,
      };
    }
  }

  async readMessages(ids: number[]): Promise<void> {
    await this.chatRepository.update(
      { id: In(ids), is_read: false },
      { is_read: true },
    );
  }

  async getMessages(
    sender_id: string,
    recipient_id: string,
    offset = 0,
    limit,
  ): Promise<GetMessagesDto> {
    const cur_limit = limit ? limit : 1;
    const cur_offset = offset ? 'and c.id < :offset' : '';
    const [node, totalCount] = await getManager()
      .createQueryBuilder(ChatEntity, 'c')
      .select([
        'c.id',
        'c.sender_id',
        'c.recipient_id',
        's.image_url',
        'c.context',
        'c.is_media',
        'c.is_read',
        'c.create_time',
      ])
      .innerJoinAndSelect('c.sender', 's', 's.id = c.sender_id')
      .innerJoinAndSelect('c.recipient', 'r', 'r.id = c.recipient_id')
      .where(
        `(c.sender_id = :sender_id and c.recipient_id = :recipient_id ${cur_offset})`,
        {
          sender_id,
          recipient_id,
          offset,
        },
      )
      .orWhere(
        `(c.sender_id = :recipient_id and c.recipient_id = :sender_id ${cur_offset})`,
        {
          sender_id,
          recipient_id,
          offset,
        },
      )
      .limit(cur_limit)
      .orderBy('c.id', 'DESC')
      .getManyAndCount();

    const _node_formatter = node.map((m) => ({
      id: m.id,
      author: m.sender_id,
      author_nickname: m.sender.nick_name,
      to: m.recipient_id,
      recipient_nickname: m.recipient.nick_name,
      avatar: m.sender?.image_url,
      state: {
        is_media: m.is_media,
        is_read: m.is_read,
      },
      context: m.context,
      create_time: m.create_time,
    }));
    const _unread_ids = _node_formatter
      .filter((m) => !m.state.is_read)
      .map((m) => m.id);
    await this.readMessages(_unread_ids);
    const unreadCount = await ChatService.getUnreadCount(
      sender_id,
      recipient_id,
    );
    return {
      totalCount,
      unreadCount,
      edges: {
        node: _node_formatter,
      },
      pageInfo: {
        hasNextPage: offset * limit + offset < totalCount,
      },
    };
  }
}
