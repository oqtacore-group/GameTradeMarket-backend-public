import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { MailModule } from './mail/mail.module';
import * as Joi from '@hapi/joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GqlModuleOptions } from '@nestjs/graphql/dist/interfaces/gql-module-options.interface';
import { Environment } from './utils/interfaces/utils.interface';
import { PATH_GQL } from './utils/constants';
import { SubscribeModule } from './account/subscribe/subscribe.module';
import { AdminModule } from './admin/admin.module';
import { SourceModule } from './source/source.module';
import { IntegrationModule } from './integration/integration.module';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { InventoryModule } from './inventory/inventory.module';
import { OpenseaBotModule } from './utils/opensea-bot/opensea-bot.module';
import { typeormModuleConfig } from './config/typeorm-module.config';
import { NotificationModule } from './notification/notification.module';
import { ReviewModule } from './review/review.module';
import { BlogModule } from './blog/blog.module';
import { GenreModule } from './genre/genre.module';
import { ActionModule } from './action/action.module';
import { TelegramModule } from './telegram/telegram.module';
import { ExchangeModule } from './exchange/exchange.module';
import { InventoryEntity } from './inventory/models/inventory.entity';
import { ImmutableModule } from './immutable/immutable.module';
import { AchievementModule } from './achievement/achievement.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        // Server Common
        NODE_ENV: Joi.string().required(),
        CLIENT_HOST: Joi.string().required(),
        CORS_ORIGINS: Joi.string().required(),
        // Database
        TYPEORM_HOST: Joi.string().required(),
        TYPEORM_PORT: Joi.number().required(),
        TYPEORM_USERNAME: Joi.string().required(),
        TYPEORM_PASSWORD: Joi.string().required(),
        TYPEORM_DATABASE: Joi.string().required(),
        TYPEORM_ENTITIES: Joi.string().required(),
        TYPEORM_MIGRATIONS_RUN: Joi.string().required(),
        TYPEORM_MIGRATIONS: Joi.string().required(),
        TYPEORM_MIGRATIONS_DIR: Joi.string().required(),
        TYPEORM_MAX_CONNECTION: Joi.number().required(),
        // AWS Bucket chat content media
        AWS_MEDIA_BUCKET_NAME: Joi.string().required(),
        AWS_STORAGE_BUCKET_NAME: Joi.string().required(),
        AWS_DISTRIBUTION_MEDIA: Joi.string().required(),
        // AWS Common
        AWS_REGION: Joi.string().required(),
        AWS_ACCOUNT_ID: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        // Mail
        MAILCHIMP_KEY: Joi.string().required(),
        MAILCHIMP_SERVER: Joi.string().required(),
        MAIL_HOST: Joi.string().required(),
        MAIL_PORT: Joi.number().required(),
        MAIL_SENDER: Joi.string().required(),
        MAIL_USERNAME: Joi.string().required(),
        MAIL_PASSWORD: Joi.string().required(),
        // JWT Auth
        PRIVATE_JWT_KEY: Joi.string().required(),
        PUBLIC_JWT_KEY: Joi.string().required(),
        PRIVATE_REFRESH_JWT_KEY: Joi.string().required(),
        PUBLIC_REFRESH_JWT_KEY: Joi.string().required(),
        PRIVATE_OVERLAY_JWT_KEY: Joi.string().required(),
        // ElasticSearch
        JOURNAL_URL: Joi.string().required(),
        // Google
        GOOGLE_AUTH_DATA: Joi.string().required(),
        GOOGLE_APPLICATION_CREDENTIALS: Joi.string().required(),
        // Opensea
        OPENSEA_API_KEY: Joi.string().required(),
        OPENSEA_BOT: Joi.string().required(),
        // Discord
        DISCORD_TOKEN_BOT: Joi.string().required(),
        DISCORD_SERVER_ID: Joi.string().required(),
        // Moralis
        MORALIS_API_KEY: Joi.string().required(),
        // Opensea SDK
        OPENSEA_SDK_API_KEY: Joi.string().required(),
        // QuickNode api
        QUICKNODE_API_KEY: Joi.string().required(),
        // metaplex GameTradeMarket address
        METAPLEX_AUCTION_HOUSE_GAME_TRADE_MARKET: Joi.string().required(),
      }),
    }),
    ScheduleModule.forRoot(),
    GraphQLModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): GqlModuleOptions => {
        const is_develop =
          configService.get('NODE_ENV') === Environment.DEVELOPMENT;
        return {
          path: PATH_GQL,
          installSubscriptionHandlers: true,
          fieldResolverEnhancers: ['guards', 'interceptors'],
          autoSchemaFile: 'schema.gql',
          sortSchema: true,
          playground: is_develop,
          introspection: is_develop,
          cors: {
            credentials: true,
            origin: configService.get('CORS_ORIGINS').split(','),
          },
          formatError: (err) => {
            let message =
              err.extensions?.exception?.response?.message || err.message;
            let code =
              err.extensions?.exception?.response?.code || err.extensions.code;

            switch (code) {
              case 'FORBIDDEN':
                message = '403';
                break;
              case 'INVALID_REFRESH_TOKEN':
                code = 'UNAUTHENTICATED';
                message = '401';
                break;
              case 'BAD_USER_INPUT':
                code = 400;
                message = `${code}; ${message}`;
                break;
            }

            return {
              message,
              code,
            };
          },
          context: async ({ req, connection }: any) => {
            return {
              response: req.res,
              cookies: req.cookies,
              headers: connection ? connection.context : req.headers,
            };
          },
        };
      },
    }),
    TypeOrmModule.forRootAsync(typeormModuleConfig),
    TypeOrmModule.forFeature([InventoryEntity]),
    AuthModule,
    AccountModule,
    ActionModule,
    ChatModule,
    MailModule,
    SubscribeModule,
    AdminModule,
    SourceModule,
    ImmutableModule,
    IntegrationModule,
    InventoryModule,
    OpenseaBotModule,
    NotificationModule,
    ReviewModule,
    BlogModule,
    HttpModule,
    GenreModule,
    TelegramModule,
    ExchangeModule,
    AchievementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
