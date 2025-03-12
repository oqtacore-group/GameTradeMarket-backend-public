import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ResourceService } from './resource.service';
import { ResourceParams } from './interfaces/resource.input';
import { Resource } from './dto/resource.dto';
import { ResourceCreateParams } from './interfaces/create-resource.input';
import { Success } from '../../utils/interfaces/response.interface';
import { CurrentUserRoles, RoleEnum } from '../role.decorator';

@Resolver()
export class ResourceResolver {
  constructor(private readonly resourceService: ResourceService) {}

  @Query(() => [Resource], { nullable: true })
  async resources(
    @Args('params', { nullable: true }) { path, name }: ResourceParams,
  ) {
    return this.resourceService.getAll(path, name);
  }

  @Mutation(() => Success)
  @CurrentUserRoles(RoleEnum.ADMIN)
  async resourceCreate(@Args('params') params: ResourceCreateParams) {
    await this.resourceService.create(params);
    return {
      message: 'resource created',
      code: 'RESOURCE_CREATED',
    };
  }

  @Mutation(() => Success)
  @CurrentUserRoles(RoleEnum.ADMIN)
  async resourceDelete(@Args('path') path: string) {
    await this.resourceService.remove(path);
    return {
      message: 'resource removed',
      code: 'RESOURCE_REMOVED',
    };
  }
}
