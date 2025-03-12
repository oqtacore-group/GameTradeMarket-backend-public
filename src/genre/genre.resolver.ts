import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { GenreEntity } from './models/genre.entity';
import { GenreCreateInput } from './dto/genre-create.input';
import { GenreService } from './genre.service';
import { GenreUpdateInput } from './dto/genre-update.input';
import { UseGuards } from '@nestjs/common';
import { UserGuard } from '../auth/auth.guard';
import { CurrentUserRoles, RoleEnum } from '../role/role.decorator';

@Resolver()
@UseGuards(UserGuard)
export class GenreResolver {
  constructor(private genreService: GenreService) {}

  @Mutation(() => GenreEntity)
  @CurrentUserRoles(RoleEnum.ADMIN)
  addGenre(@Args('params') params: GenreCreateInput): Promise<GenreEntity> {
    return this.genreService.create(params);
  }

  @Mutation(() => GenreEntity)
  @CurrentUserRoles(RoleEnum.ADMIN)
  updateGenre(@Args('params') params: GenreUpdateInput): Promise<GenreEntity> {
    return this.genreService.update(params);
  }

  @Mutation(() => Boolean)
  @CurrentUserRoles(RoleEnum.ADMIN)
  removeGenre(
    @Args('code', { type: () => String }) code: string,
  ): Promise<boolean> {
    return this.genreService.remove(code);
  }
}
