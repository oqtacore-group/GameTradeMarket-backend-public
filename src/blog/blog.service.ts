import {
  CACHE_MANAGER,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogEntity } from './models/blog.entity';
import {
  CreateBlogParams,
  DeleteBlogParams,
  GetAllBlogParams,
  GetLastMediumBlogParams,
  UpdateBlogParams,
} from './blog.interface';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { MarketBlog } from './dto/market-blog.dto';
import { Cache } from 'cache-manager';

@Injectable()
export class BlogService {
  private logger = new Logger(BlogService.name);

  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogRepository: Repository<BlogEntity>,
    private httpService: HttpService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(params: CreateBlogParams): Promise<BlogEntity> {
    const blog = await this.blogRepository.save(params);
    return this.blogRepository.findOne({
      where: { id: blog.id },
    });
  }

  async delete(params: DeleteBlogParams): Promise<boolean> {
    const { id } = params;
    const deleteResult = await this.blogRepository.delete(id);
    return deleteResult.affected > 0;
  }

  async getAll(params: GetAllBlogParams): Promise<BlogEntity[]> {
    if (!params.gameCode) {
      return [];
    }
    return this.blogRepository.find({
      where: {
        game_code: params.gameCode,
      },
      order: {
        create_time: 'DESC',
      },
    });
  }

  async getMarketBlogs(): Promise<MarketBlog[]> {
    const cache = await this.cacheManager.get('blogs');

    if (cache) {
      return cache;
    }
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          'https://blog.gametrade.market/wp-json/wp/v2/posts',
        ),
      );

      const blogs = response.data.map((post) => {
        return {
          id: post.id,
          external_url: post.link,
          description: post.content.rendered,
          title: post.title.rendered,
          img_url: post.jetpack_featured_media_url,
          is_published: post.status === 'publish',
          create_time: post.date,
        };
      });

      await this.cacheManager.set('blogs', blogs);

      return blogs;
    } catch (err) {
      this.logger.error(err.message);
      return [];
    }
  }

  async update(user_id: string, params: UpdateBlogParams): Promise<BlogEntity> {
    const blog = await this.blogRepository.findOne({
      where: { id: params.id },
    });
    if (!blog) {
      throw new NotFoundException('blog not found');
    }
    if (blog.user_id !== user_id) {
      throw new ForbiddenException('access denied');
    }
    await this.blogRepository.save(params);
    return this.blogRepository.findOne({
      where: { id: params.id },
    });
  }

  async getLastMediumBlog(
    params: GetLastMediumBlogParams,
  ): Promise<BlogEntity> {
    return this.blogRepository.findOne({
      select: ['game_code', 'create_time', 'external_url', 'title'],
      where: {
        game_code: params.gameCode,
      },
      order: {
        create_time: 'DESC',
      },
    });
  }
}
