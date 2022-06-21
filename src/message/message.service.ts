import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { createMessageDto } from './dtos/create-message.dto';
import { Message } from './models/message.model';
import { ConversationService } from 'src/conversation/conversation.service';
import { FileService, FileType } from 'src/file/file.service';
import { ChatService } from 'src/chat/chat.service';

export enum FileTypes {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
}

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message) private messageRepository: typeof Message,
    private conversationService: ConversationService,
    private fileService: FileService,
  ) {}

  async create(dto: createMessageDto, files: Express.Multer.File[]) {
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

    const sentAt = new Date(Date.now()).getTime().toString();

    const message = await this.messageRepository.create({
      ...dto,
      sentAt,
      images: imagesName,
      audios: audiosName,
      videos: videosName,
    });

    const conversation = await this.conversationService.getOne(
      message.conversationId,
    );

    await conversation.$add('messages', message.id);

    return message;
  }

  async delete(id: number) {
    const message = await this.messageRepository.destroy({ where: { id } });

    if (!message) {
      throw new HttpException(`No message to delete.`, HttpStatus.NOT_FOUND);
    }

    return message;
  }

  async getOne(id: number) {
    const message = await this.messageRepository.findOne({ where: { id } });

    if (!message) {
      throw new HttpException(
        `No message with id: ${id}.`,
        HttpStatus.NOT_FOUND,
      );
    }

    return message;
  }

  async getLast(conversationId: number) {
    const message = await this.messageRepository.findOne({
      where: { conversationId },
      order: [['id', 'DESC']],
    });

    if (!message) {
      throw new HttpException(
        `Last message has not been found.`,
        HttpStatus.NOT_FOUND,
      );
    }

    return message;
  }
}
