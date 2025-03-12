import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  AchievementDto,
  CreateAchievementInput,
  UpdateAchievementInput,
} from './dto';
import { AchievementService } from './achievement.service';
import { Observable } from 'rxjs';
import { OverlayJwtGuard } from '../auth/auth.guard';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@UseGuards(OverlayJwtGuard)
@UsePipes(new ValidationPipe())
@Controller('/achievement')
@ApiTags('Achievements')
@ApiSecurity('apiKey')
export class AchievementController {
  constructor(private achievementService: AchievementService) {}

  @Post()
  @HttpCode(201)
  @ApiUnauthorizedResponse()
  @ApiOperation({ summary: 'Create achievement' })
  @ApiCreatedResponse({
    description: 'The achievement record',
    type: AchievementDto,
  })
  @ApiBody({ type: CreateAchievementInput })
  create(@Body() body: CreateAchievementInput): Observable<AchievementDto> {
    return this.achievementService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update achievement' })
  @ApiUnauthorizedResponse()
  @ApiOkResponse({
    description: 'The achievement record',
    type: AchievementDto,
  })
  @ApiBody({ type: UpdateAchievementInput })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAchievementInput,
  ): Observable<AchievementDto> {
    return this.achievementService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiUnauthorizedResponse()
  @ApiNoContentResponse({
    description: 'The achievement deleted',
  })
  @ApiOperation({ summary: 'Delete achievement' })
  delete(@Param('id', ParseIntPipe) id: number): Observable<void> {
    return this.achievementService.delete(id);
  }
}
