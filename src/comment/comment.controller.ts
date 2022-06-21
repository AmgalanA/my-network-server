import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CommentService } from './comment.service';
import { createCommentDto } from './dtos/create-comment.dto';
import { likeCommentDto } from './dtos/like-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Post('send')
  send(@Body() commentDto: createCommentDto) {
    return this.commentService.create(commentDto);
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Put('toggle-like')
  toggleLike(@Body() commentDto: likeCommentDto) {
    return this.commentService.toggleLikeComment(commentDto);
  }

  @Get('get/:postId')
  get(@Param('postId') postId: number) {
    return this.commentService.get(postId);
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Put('check-if-liked')
  checkIfLiked(@Body() commentDto: likeCommentDto) {
    return this.commentService.checkIfCommentLiked(commentDto);
  }
}
