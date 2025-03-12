import { Injectable } from '@nestjs/common';
import {
  AchievementDto,
  CreateAchievementInput,
  UpdateAchievementInput,
} from './dto';
import { forkJoin, from, Observable, of, switchMap } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AchievementEntity } from './models/achievement.entity';
import { map } from 'rxjs/operators';

@Injectable()
export class AchievementService {
  constructor(
    @InjectRepository(AchievementEntity)
    private achievementRepository: Repository<AchievementEntity>,
  ) {}

  create(body: CreateAchievementInput): Observable<AchievementDto> {
    return from(this.achievementRepository.save(body)).pipe(
      switchMap((achievement) => {
        return forkJoin([
          of(achievement),
          from(this.achievementRepository.count({ game_code: body.game_code })),
        ]);
      }),
      map(([achievement, total]) => ({
        ...achievement,
        total,
      })),
    );
  }

  update(id: number, body: UpdateAchievementInput): Observable<AchievementDto> {
    return from(this.achievementRepository.save({ id, ...body })).pipe(
      switchMap((achievement) => {
        return forkJoin([
          of(achievement),
          from(
            this.achievementRepository.count({
              game_code: achievement.game_code,
            }),
          ),
        ]);
      }),
      map(([achievement, total]) => ({
        ...achievement,
        total,
      })),
    );
  }

  delete(id: number): Observable<void> {
    return from(this.achievementRepository.delete({ id })).pipe(
      map(() => null),
    );
  }
}
