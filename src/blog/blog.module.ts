import { CacheModule, Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogResolver } from './blog.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './models/blog.entity';
import { AuthModule } from '../auth/auth.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    AuthModule,
    HttpModule,
    TypeOrmModule.forFeature([BlogEntity]),
    CacheModule.register({
      ttl: 43200, // in sec
    }),
  ],
  providers: [BlogService, BlogResolver],
  exports: [BlogService],
})
export class BlogModule {}
