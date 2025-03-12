import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GenreEntity } from './models/genre.entity';
import { GenreCreateInput } from './dto/genre-create.input';
import { GenreUpdateInput } from './dto/genre-update.input';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(GenreEntity)
    private genreRepository: Repository<GenreEntity>,
  ) {}

  async create(params: GenreCreateInput): Promise<GenreEntity> {
    const { name } = params;
    const genre = await this.genreRepository.findOne({ where: { name } });
    if (genre) {
      return genre;
    }
    return this.genreRepository.save({
      name,
      code: name.toUpperCase().replace(' ', '_'),
    });
  }

  update(params: GenreUpdateInput): Promise<GenreEntity> {
    return this.genreRepository.save({ ...params });
  }

  async remove(code: string): Promise<boolean> {
    const deleteResult = await this.genreRepository.delete(code);
    return deleteResult.affected > 0;
  }
}
