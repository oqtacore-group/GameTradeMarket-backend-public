import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceResolver } from './resource.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceEntity } from './models/resource.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ResourceEntity])],
  providers: [ResourceService, ResourceResolver],
})
export class ResourceModule {}
