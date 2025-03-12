import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceEntity } from './models/resource.entity';
import { ResourceCreateParams } from './interfaces/create-resource.input';

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(ResourceEntity)
    private readonly resourceRepository: Repository<ResourceEntity>,
  ) {}

  async getAll(path: string, name: string): Promise<ResourceEntity[]> {
    return this.resourceRepository.find({ where: { code: path, name } });
  }

  async create(payload: ResourceCreateParams) {
    return this.resourceRepository.insert(payload);
  }

  async remove(code: string) {
    return this.resourceRepository.delete({ code });
  }
}
