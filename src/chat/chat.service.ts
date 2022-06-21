import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { FileService, FileType } from 'src/file/file.service';
import { FileTypes } from 'src/message/message.service';
import { AddAdminDto } from './dtos/add-admin.dto';
import { createChatDto } from './dtos/create-chat.dto';
import { deleteMessageDto } from './dtos/delete-message.dto';
import { joinChatDto } from './dtos/join-chat.dto';
import { leaveChatDto } from './dtos/leave-chat.dto';
import { createMessageDto } from './dtos/messages/create-message.dto';
import { ChatInvite } from './models/chat-invite.model';
import { ChatLeaving } from './models/chat-leaving.model';
import { ChatMessage } from './models/chat-message.model';
import { Chat } from './models/chat.model';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat) private chatRepository: typeof Chat,
    @InjectModel(ChatMessage) private chatMessageRepository: typeof ChatMessage,
    @InjectModel(ChatInvite) private chatInviteRepository: typeof ChatInvite,
    @InjectModel(ChatLeaving) private chatLeavingRepository: typeof ChatLeaving,
    private fileService: FileService,
  ) {}

  async create(dto: createChatDto, file: Express.Multer.File) {
    const avatar = this.fileService.createFile(FileType.CHAT_AVATAR, file);

    const chat = await this.chatRepository.create({
      ...dto,
      avatar,
    });

    chat.members = [...chat.members, dto.creatorId];
    chat.admins = [...chat.admins, dto.creatorId];

    await chat.save();

    return chat;
  }

  async getByMemberId(memberId: number) {
    const chats = await this.chatRepository.findAll({
      where: {
        members: {
          [Op.contains]: [memberId],
        },
      },
    });

    return chats;
  }

  async getByCreatorId(creatorId: number) {
    const chats = await this.chatRepository.findOne({ where: { creatorId } });

    return chats;
  }

  async getByAdminId(adminId: number) {
    const chats = await this.chatRepository.findAll({
      where: {
        admins: {
          [Op.contains]: [adminId],
        },
      },
    });

    return chats;
  }

  async addAdmin(dto: AddAdminDto) {
    const chat = await this.chatRepository.findOne({ where: { id: dto.id } });

    if (!chat) {
      throw new HttpException(
        `No chat with id: ${dto.id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    chat.admins = [...chat.admins, dto.profileId];

    await chat.save();

    return chat;
  }

  async getOne(id: number) {
    const chat = await this.chatRepository.findOne({
      where: { id },
      include: { all: true },
    });

    if (!chat) {
      throw new HttpException(`No chat with id: ${id}`, HttpStatus.NOT_FOUND);
    }

    return chat;
  }

  async addMember(dto: joinChatDto) {
    const sentAt = new Date(Date.now()).getTime().toString();

    const invite = await this.chatInviteRepository.create({
      ...dto,
      sentAt,
    });

    const chat = await this.getOne(dto.chatId);

    chat.members = [...chat.members, dto.toId];

    await chat.$add('invites', invite.id);

    await chat.save();

    return chat;
  }

  async leaveChat(dto: leaveChatDto) {
    const sentAt = new Date(Date.now()).getTime().toString();

    const leaving = await this.chatLeavingRepository.create({
      ...dto,
      sentAt,
      chatId: dto.id,
    });

    const chat = await this.getOne(dto.id);

    chat.members = chat.members.filter((memberId) => memberId !== dto.id);

    await chat.$add('leavings', leaving);

    await chat.save();

    return chat;
  }

  async sendMessage(dto: createMessageDto, files: Express.Multer.File[]) {
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

    const message = await this.chatMessageRepository.create({
      ...dto,
      sentAt,
      images: imagesName,
      audios: audiosName,
      videos: videosName,
    });

    const chat = await this.getOne(message.chatId);

    await chat.$add('messages', message.id);

    return message;
  }

  async removeMessage(dto: deleteMessageDto) {
    const message = await this.chatMessageRepository.destroy({
      where: { id: dto.messageId },
    });

    if (!message) {
      throw new HttpException(
        `No message with id: ${dto.messageId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    const chat = await this.getOne(dto.id);

    await chat.$remove('messages', dto.messageId);

    return chat;
  }

  async getMessage(messageId: number) {
    const message = await this.chatMessageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new HttpException(
        `No message with id: ${messageId}.`,
        HttpStatus.NOT_FOUND,
      );
    }

    return message;
  }

  async getLast(chatId: number) {
    const message = await this.chatMessageRepository.findOne({
      where: { chatId },
      order: [['id', 'DESC']],
    });

    if (!message) {
      // throw new HttpException(
      //   `Last message has not been found.`,
      //   HttpStatus.NOT_FOUND,
      // );
      return null;
    }

    return message;
  }

  async getInvites(chatId: number) {
    const invites = await this.chatInviteRepository.findAll({
      where: { chatId },
      include: { all: true },
    });

    return invites;
  }

  async getLeavings(chatId: number) {
    const leavings = await this.chatLeavingRepository.findAll({
      where: { chatId },
      include: { all: true },
    });

    return leavings;
  }
}
