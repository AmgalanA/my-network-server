import { forwardRef, Inject } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { CommentService } from 'src/comment/comment.service';
import { createCommentDto } from 'src/comment/dtos/create-comment.dto';
import { deleteCommentDto } from 'src/comment/dtos/delete-comment.dto';
import { likeCommentDto } from 'src/comment/dtos/like-comment.dto';
import { deletePostDto } from '../dtos/delete-post.dto';
import { likePostDto } from '../dtos/like-post.dto';
import { sendPostDto } from '../dtos/send-post.dto';
import { PostService } from '../post.service';
import { PathType } from './path-types';

@WebSocketGateway(80, { namespace: 'post', cors: true })
export class PostGateway {
  constructor(
    private postService: PostService,
    @Inject(forwardRef(() => CommentService))
    private commentService: CommentService,
  ) {}

  @WebSocketServer()
  server: Server;

  async getPosts(@MessageBody() postDto: sendPostDto) {
    const posts = await this.postService.get(postDto.limit);

    if (postDto.groupId) {
      // Emit to group
      this.server.to(postDto.groupId.toString()).emit('get-posts-group', posts);
    }

    // Broadcast
    this.server.emit(PathType.GET_POSTS, posts);
    // this.server.send(PathType.GET_POSTS, posts);
  }

  async getPost(@MessageBody() id: number) {
    const post = await this.postService.getOne(id);

    if (post.groupId) {
      // Emit to group
      this.server.to(post.groupId.toString()).emit('get-post-group', post);
    }

    // Broadcast
    // this.server.send(PathType.GET_POST, post);
    this.server.emit(PathType.GET_POST, post);
  }

  // @SubscribeMessage(PathType.CREATE)
  // async create(@MessageBody() postDto: sendPostDto) {
  //   await this.getPosts(postDto);
  // }

  @SubscribeMessage(PathType.CREATE)
  async create(@MessageBody() id: number) {
    await this.getPost(id);
  }

  @SubscribeMessage(PathType.DELETE)
  async delete(@MessageBody() postDto: deletePostDto) {
    const post = await this.postService.delete(postDto.id);

    await this.getPosts({
      limit: postDto.limit,
      senderId: postDto.senderId,
      groupId: postDto.groupId,
    });
  }

  async getShowingPost(@MessageBody() id: number) {
    const post = await this.postService.getOne(id);

    this.server.emit(PathType.GET_SHOWING_POST, post);
  }

  @SubscribeMessage(PathType.TOGGLE_LIKE_POST)
  async toggleLikePost(@MessageBody() postDto: likePostDto) {
    const post = await this.postService.toggleLikePost(postDto);

    await this.getShowingPost(post.id);
  }

  @SubscribeMessage(PathType.COMMENT_POST)
  async commentPost(@MessageBody() commentDto: createCommentDto) {
    const comment = await this.commentService.create(commentDto);

    await this.getShowingPost(comment.postId);
  }

  @SubscribeMessage(PathType.REMOVE_COMMENT_POST)
  async removeComment(@MessageBody() commentDto: deleteCommentDto) {
    const comment = await this.commentService.delete(commentDto);

    await this.getShowingPost(commentDto.postId);
  }

  @SubscribeMessage(PathType.TOGGLE_LIKE_COMMENT)
  async toggleLikeComment(@MessageBody() commentDto: likeCommentDto) {
    const comment = await this.commentService.toggleLikeComment(commentDto);

    await this.getShowingPost(comment.postId);
  }
}
