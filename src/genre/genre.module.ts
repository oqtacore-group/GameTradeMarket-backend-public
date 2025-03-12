import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenreEntity } from './models/genre.entity';
import { GenreService } from './genre.service';
import { GenreResolver } from './genre.resolver';
import { AuthModule } from '../auth/auth.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [AuthModule, RoleModule, TypeOrmModule.forFeature([GenreEntity])],
  providers: [GenreService, GenreResolver],
  exports: [GenreService],
})
export class GenreModule {}
