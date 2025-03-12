import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const typeormModuleConfig = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
    return {
      host: configService.get<string>('TYPEORM_HOST'),
      port: configService.get<number>('TYPEORM_PORT'),
      username: configService.get<string>('TYPEORM_USERNAME'),
      password: configService.get<string>('TYPEORM_PASSWORD'),
      database: configService.get<string>('TYPEORM_DATABASE'),
      entities: JSON.parse(configService.get<string>('TYPEORM_ENTITIES')),
      type: 'postgres',
      migrationsRun: configService.get<boolean>('TYPEORM_MIGRATIONS_RUN'),
      migrations: [configService.get<string>('TYPEORM_MIGRATIONS')],
      extra: {
        connectionLimit: configService.get<number>('TYPEORM_MAX_CONNECTION'),
      },
      cli: {
        migrationsDir: configService.get<string>('TYPEORM_MIGRATIONS_DIR'),
      },
    };
  },
};
