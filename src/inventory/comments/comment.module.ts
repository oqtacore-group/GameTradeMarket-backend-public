import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './models/comment.entity';
import { CommentService } from './comment.service';
import { CommentAuthResolver } from './comment.resolver';
import { AuthModule } from '../../auth/auth.module';
import { RoleModule } from '../../role/role.module';
import { CommentLikeEntity } from './models/comment-like.entity';
import { AccountEntity } from '../../account/models/account.entity';

@Module({
  imports: [
    AuthModule,
    RoleModule,
    TypeOrmModule.forFeature([CommentEntity, CommentLikeEntity, AccountEntity]),
  ],
  providers: [CommentService, CommentAuthResolver],
  exports: [CommentService],
})
export class CommentModule {}
