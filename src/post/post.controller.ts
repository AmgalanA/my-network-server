import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { createCommentDto } from 'src/comment/dtos/create-comment.dto';
import { createPostDto } from './dtos/create-post.dto';
import { likePostDto } from './dtos/like-post.dto';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Post('/create')
  @UseInterceptors(FilesInterceptor('files'))
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() postDto: createPostDto,
  ) {
    return this.postService.create(postDto, files);
  }

  @HttpCode(200)
  @Get('get-one/:id')
  getOne(@Param('id') id: number) {
    return this.postService.getOne(id);
  }

  @HttpCode(200)
  @Get('get')
  get(@Query('limit') limit: number) {
    return this.postService.get(limit);
  }

  @HttpCode(200)
  @Get('get-by-sender-id/:senderId')
  getBySenderId(@Param('senderId') senderId: number) {
    return this.postService.getBySenderId(senderId);
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Put('check-if-post-liked')
  checkIfPostLiked(@Body() postDto: likePostDto) {
    return this.postService.checkIfPostLiked(postDto);
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Put('toggle-like-post')
  likePost(@Body() likePostDto: likePostDto) {
    return this.postService.toggleLikePost(likePostDto);
  }
}
