import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewResolver } from './review.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from './models/review.entity';
import { AuthModule } from '../auth/auth.module';
import { AccountEntity } from '../account/models/account.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([ReviewEntity, AccountEntity]),
  ],
  providers: [ReviewService, ReviewResolver],
  exports: [ReviewService],
})
export class ReviewModule {}
