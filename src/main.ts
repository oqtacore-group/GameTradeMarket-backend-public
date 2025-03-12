import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { PREFIX_APP } from './utils/constants';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import bodyParser from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { Environment } from './utils/interfaces/utils.interface';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TelegramService } from './telegram/telegram.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const telegramService = app.get(TelegramService);
  const _origins = configService.get('CORS_ORIGINS').split(',');
  const is_develop = configService.get('NODE_ENV') == Environment.DEVELOPMENT;
  if (!is_develop) {
    app.use(helmet());
  }
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || _origins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error(`${origin} Not allowed by CORS`));
      }
    },
    credentials: true,
  });
  app.set('trust proxy', 1);
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.setGlobalPrefix(PREFIX_APP);
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalInterceptors(new LoggingInterceptor(telegramService));

  config.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    region: configService.get('AWS_REGION'),
  });

  const documentConfig = new DocumentBuilder()
    .setTitle('Partner API')
    .setDescription('The API description')
    .setVersion('0.0.1')
    .addApiKey(
      {
        type: 'apiKey',
      },
      'X-Api-Key',
    )
    .build();
  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('partner/docs', app, document);

  await app.listen(8080);
}

bootstrap().then();
