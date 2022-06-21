import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { AuthGuard } from 'src/auth/guards/auth.guard';
import { createMessageDto } from 'src/message/dtos/create-message.dto';
import { ConversationService } from './conversation.service';
import { createConversationDto } from './dtos/create-conversation.dto';
import { MessageService } from '../message/message.service';

@Controller('conversation')
export class ConversationController {
  constructor(
    private conversationService: ConversationService,
    private messageService: MessageService,
  ) {}

  @Post('create')
  create(@Body() dto: createConversationDto) {
    return this.conversationService.create(dto);
  }

  @Get('get-one/:id')
  getOne(@Param('id') id: number) {
    return this.conversationService.getOne(id);
  }

  @Get('get-by-profile-id/:profileId')
  getByProfileId(@Param('profileId') profileId: number) {
    return this.conversationService.getByProfileId(profileId);
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Post('/send-message')
  @UseInterceptors(FilesInterceptor('files'))
  sendMessage(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: createMessageDto,
  ) {
    return this.messageService.create(dto, files);
  }

  @UseGuards(AuthGuard)
  @Get('get-message/:messageId')
  getMessage(@Param('messageId') messageId: number) {
    return this.messageService.getOne(messageId);
  }

  // @UseGuards(AuthGuard)
  @Get('get-last-message/:id')
  getLastMessage(@Param('id') id: number) {
    return this.messageService.getLast(id);
  }
}
