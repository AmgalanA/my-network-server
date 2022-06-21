import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostModule } from 'src/post/post.module';
import { CommentService } from './comment.service';
import { Comment } from './models/comment.model';
import { CommentController } from './comment.controller';
import { TokenModule } from 'src/token/token.module';
import { ProfileModule } from 'src/profile/profile.module';

@Module({
  providers: [CommentService],
  imports: [
    SequelizeModule.forFeature([Comment]),
    forwardRef(() => PostModule),
    TokenModule,
    ProfileModule,
  ],
  exports: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
