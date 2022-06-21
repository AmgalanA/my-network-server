import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { createConversationDto } from './dtos/create-conversation.dto';
import { Conversation } from './models/conversation.model';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation)
    private conversationRepository: typeof Conversation,
  ) {}

  async create(dto: createConversationDto) {
    const candidate = await this.conversationRepository.findOne({
      where: {
        ids: {
          [Op.contains]: [...dto.ids],
        },
      },
    });

    if (candidate) {
      return candidate;
    }

    const conversation = await this.conversationRepository.create(dto);

    return conversation;
  }

  async getOne(id: number) {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      include: { all: true },
    });

    if (!conversation) {
      throw new HttpException(`No conversation`, HttpStatus.NOT_FOUND);
    }

    return conversation;
  }

  async getByProfileId(profileId: number) {
    const conversations = await this.conversationRepository.findAll({
      where: {
        ids: {
          [Op.contains]: [profileId],
        },
      },
    });

    return conversations;
  }
}
