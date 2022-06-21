import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ChatService } from './chat.service';
import { createChatDto } from './dtos/create-chat.dto';
import { joinChatDto } from './dtos/join-chat.dto';
import { leaveChatDto } from './dtos/leave-chat.dto';
import { createMessageDto } from './dtos/messages/create-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('avatar'))
  create(
    @Body() dto: createChatDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    return this.chatService.create(dto, avatar);
  }

  @Get('/get-by-member-id/:profileId')
  getByMemberId(@Param('profileId') profileId: number) {
    return this.chatService.getByMemberId(profileId);
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Post('/send-message')
  @UseInterceptors(FilesInterceptor('files'))
  sendMessage(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: createMessageDto,
  ) {
    return this.chatService.sendMessage(dto, files);
  }

  @Get('/get-last-message/:chatId')
  getLastMessage(@Param('chatId') chatId: number) {
    return this.chatService.getLast(chatId);
  }

  @Get('/get-one/:id')
  getOne(@Param('id') id: number) {
    return this.chatService.getOne(id);
  }

  @Put('/add-member')
  addMember(@Body() dto: joinChatDto) {
    return this.chatService.addMember(dto);
  }

  @Put('/leave-chat')
  leaveChat(@Body() dto: leaveChatDto) {
    return this.chatService.leaveChat(dto);
  }

  @Get('/get-invites/:id')
  getInvites(@Param('id') id: number) {
    return this.chatService.getInvites(id);
  }

  @Get('/get-leavings/:id')
  getLeavings(@Param('id') id: number) {
    return this.chatService.getLeavings(id);
  }
}
