import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommentModule } from 'src/comment/comment.module';
import { FileModule } from 'src/file/file.module';
import { TokenModule } from 'src/token/token.module';

import { Comment } from '../comment/models/comment.model';
import { PostGateway } from './gateways/post.gateway';
import { Post } from './models/post.model';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  controllers: [PostController],
  providers: [PostService, PostGateway],
  imports: [
    SequelizeModule.forFeature([Comment, Post]),
    FileModule,
    TokenModule,
    forwardRef(() => CommentModule),
  ],
  exports: [PostService],
})
export class PostModule {}
