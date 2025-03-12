import { Module } from '@nestjs/common';
import { AchievementController } from './achievement.controller';
import { AchievementService } from './achievement.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementEntity } from './models/achievement.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([AchievementEntity])],
  controllers: [AchievementController],
  providers: [AchievementService],
})
export class AchievementModule {}
