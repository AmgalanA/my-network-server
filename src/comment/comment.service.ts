import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PostService } from 'src/post/post.service';
import { ProfileService } from 'src/profile/profile.service';
import { createCommentDto } from './dtos/create-comment.dto';
import { deleteCommentDto } from './dtos/delete-comment.dto';
import { likeCommentDto } from './dtos/like-comment.dto';
import { Comment } from './models/comment.model';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment) private commentRepository: typeof Comment,
    @Inject(forwardRef(() => PostService))
    private postService: PostService,
    private profileService: ProfileService,
  ) {}

  async create(commentDto: createCommentDto) {
    const sentAt = new Date(Date.now()).getTime().toString();

    const comment = await this.commentRepository.create({
      ...commentDto,
      sentAt,
    });

    const post = await this.postService.getOne(comment.postId);

    if (!post) {
      throw new HttpException(
        `No post with id: ${comment.postId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await post.$add('comments', comment);

    return comment;
  }

  async getOne(id: number) {
    const comment = await this.commentRepository.findOne({ where: { id } });

    if (!comment) return null;

    return comment;
  }

  async delete(commentDto: deleteCommentDto) {
    const comment = await this.commentRepository.destroy({
      where: { id: commentDto.id },
    });

    const post = await this.postService.getOne(commentDto.postId);

    if (!post) {
      throw new HttpException(
        `No post with id: ${commentDto.postId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await post.$set(
      'comments',
      post.comments.filter((comment) => comment.id !== commentDto.id),
    );

    return comment;
  }

  async toggleLikeComment(commentDto: likeCommentDto) {
    const comment = await this.getOne(commentDto.id);

    if (!comment) {
      throw new HttpException(
        `No post with id: ${commentDto.id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (comment.likes.includes(commentDto.profileId)) {
      comment.likes = comment.likes.filter(
        (like) => like !== commentDto.profileId,
      );
    } else {
      comment.likes = [...comment.likes, commentDto.profileId];
    }

    await comment.save();
    return comment;
  }

  async likeComment(commentDto: likeCommentDto) {
    const comment = await this.getOne(commentDto.id);

    if (!comment) {
      throw new HttpException(
        `No post with id: ${commentDto.id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await comment.$add('likes', commentDto.profileId);

    return comment;
  }

  async deleteLikeComment(commentDto: likeCommentDto) {
    const comment = await this.getOne(commentDto.id);

    if (!comment) {
      throw new HttpException(
        `No post with id: ${commentDto.id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    await comment.$set(
      'likes',
      comment.likes.filter((like) => like !== commentDto.profileId),
    );

    return comment;
  }

  async checkIfCommentLiked(commentDto: likeCommentDto) {
    const comment = await this.getOne(commentDto.id);

    if (!comment) {
      throw new HttpException(
        `No post with id: ${commentDto.id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return comment.likes.includes(commentDto.profileId);
  }

  async get(postId: number) {
    const comments = await this.commentRepository.findAll({
      where: { postId },
      order: [['id', 'ASC']],
    });

    const commentSenders = await Promise.all(
      comments.map(async (comment) => {
        const sender = await this.profileService.getOne(comment.senderId);

        return {
          comment,
          sender,
        };
      }),
    );

    return commentSenders;
  }
}
