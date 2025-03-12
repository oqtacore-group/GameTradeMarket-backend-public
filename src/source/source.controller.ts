import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BlogService } from '../blog/blog.service';
import { BlogEntity } from '../blog/models/blog.entity';
import { GetBlogsQuery } from './dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@UsePipes(new ValidationPipe())
@ApiTags('Overlay game')
@Controller('overlay/game')
export class SourceController {
  constructor(private blogService: BlogService) {}

  @Get('/blogs')
  @ApiOperation({ summary: 'Get blogs' })
  @ApiOkResponse({
    description: 'Get blogs',
    type: [BlogEntity],
  })
  handlerGetBlogs(@Query() query: GetBlogsQuery): Promise<BlogEntity[]> {
    return this.blogService.getAll(query);
  }
}
