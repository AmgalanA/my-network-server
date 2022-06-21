import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FileService, FileType } from 'src/file/file.service';
import { createPostDto } from './dtos/create-post.dto';
import { Comment } from '../comment/models/comment.model';

import { Post } from './models/post.model';
import { likePostDto } from './dtos/like-post.dto';

enum FileTypes {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
}

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post) private postRepository: typeof Post,
    private fileService: FileService,
  ) {}

  async create(postDto: createPostDto, files: Express.Multer.File[]) {
    if (files.length > 10) {
      throw new HttpException(`Media limit exceeded.`, HttpStatus.BAD_REQUEST);
    }

    let imagesName = [];
    let videosName = [];
    let audiosName = [];

    files.map((file) => {
      switch (file.mimetype.split('/')[0]) {
        case FileTypes.IMAGE:
          const imageFileName = this.fileService.createFile(
            FileType.POST_IMAGE,
            file,
          );
          imagesName = [...imagesName, imageFileName];
          break;
        case FileTypes.VIDEO:
          const videoFileName = this.fileService.createFile(
            FileType.POST_VIDEO,
            file,
          );
          videosName = [...videosName, videoFileName];
          break;
        default:
          const audioFileName = this.fileService.createFile(
            FileType.POST_AUDIO,
            file,
          );
          audiosName = [...audiosName, audioFileName];
          break;
      }
    });

    const postedAt = new Date(Date.now()).getTime().toString();

    const post = await this.postRepository.create({
      ...postDto,
      images: imagesName,
      audios: audiosName,
      videos: videosName,
      postedAt,
    });

    return post;
  }

  async getOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      include: { all: true },
    });

    if (!post) return null;

    return post;
  }

  async likePost(postDto: likePostDto) {
    const post = await this.getOne(postDto.id);

    if (!post) {
      throw new HttpException(
        `No post with id: ${postDto.id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    post.likes = [...post.likes, postDto.profileId];
    await post.save();

    return post;
  }

  async deleteLikePost(postDto: likePostDto) {
    const post = await this.getOne(postDto.id);

    if (!post) {
      throw new HttpException(
        `No post with id: ${postDto.id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    post.likes = post.likes.filter((like) => like !== postDto.profileId);
    await post.save();

    return post;
  }

  async toggleLikePost(postDto: likePostDto): Promise<Post> {
    const hasLiked = await this.checkIfPostLiked(postDto);

    if (hasLiked) {
      const post = await this.deleteLikePost(postDto);

      return post;
    } else {
      const post = await this.likePost(postDto);

      return post;
    }
  }

  async checkIfPostLiked(postDto: likePostDto) {
    const post = await this.getOne(postDto.id);

    if (!post) {
      throw new HttpException(
        `No post with id: ${postDto.id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return post.likes.includes(postDto.profileId);
  }

  async delete(id: number) {
    const post = await this.postRepository.destroy({ where: { id } });

    if (!post) {
      throw new HttpException(`No post with id: ${id}`, HttpStatus.BAD_REQUEST);
    }

    return post;
  }

  async get(limit: number) {
    const posts = await this.postRepository.findAll({
      limit,
      order: [['id', 'ASC']],
    });

    return posts;
  }

  async getBySenderId(senderId: number, limit?: number) {
    const posts = await this.postRepository.findAll({
      where: { senderId },
      limit,
    });

    return posts;
  }
}
