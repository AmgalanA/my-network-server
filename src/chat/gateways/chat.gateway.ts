import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChatService } from '../chat.service';
import { deleteMessageDto } from '../dtos/delete-message.dto';
import { joinChatDto } from '../dtos/join-chat.dto';
import { typingDto } from '../dtos/typing.dto';
import { ChatPathTypes } from './path-types';

@WebSocketGateway(80, { namespace: 'chat', cors: true })
export class ChatGateway {
  constructor(private chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  typing: number[] = [];

  async getChat(@MessageBody() id: number) {
    const chat = await this.chatService.getOne(id);

    this.server.to(id.toString()).emit(ChatPathTypes.GET_CHAT, chat);
  }

  async updateChats(@MessageBody() profileId: number) {
    this.server.to(profileId.toString()).emit(ChatPathTypes.UPDATE_CHAT);
  }

  @SubscribeMessage(ChatPathTypes.SEND_MESSAGE)
  async sendMessage(@MessageBody() id: number) {
    await this.getChat(id);

    const chat = await this.chatService.getOne(id);

    chat.members.map(async (member) => {
      await this.updateChats(member);
    });
  }

  @SubscribeMessage(ChatPathTypes.REMOVE_MESSAGE)
  async removeMessage(@MessageBody() dto: deleteMessageDto) {
    await this.chatService.removeMessage(dto);

    await this.getChat(dto.id);
  }

  @SubscribeMessage(ChatPathTypes.JOIN_CHAT)
  async joinChat(@MessageBody() dto: joinChatDto) {
    const chat = await this.chatService.addMember(dto);

    chat.members.map(async (member) => {
      await this.updateChats(member);
    });
  }

  @SubscribeMessage(ChatPathTypes.JOIN_ROOM)
  async joinRoom(@MessageBody() id: number, @ConnectedSocket() client: Socket) {
    client.join(id.toString());

    client.emit('joined-room');
  }

  @SubscribeMessage(ChatPathTypes.LEAVE_ROOM)
  async leaveRoom(
    @MessageBody() id: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(id.toString());

    client.emit('left-room');
  }

  getTyping(id: number) {
    this.server.to(id.toString()).emit(ChatPathTypes.GET_TYPING, this.typing);
  }

  @SubscribeMessage(ChatPathTypes.ADD_TYPING)
  addTyping(@MessageBody() dto: typingDto) {
    this.typing = [...new Set([...this.typing, dto.currentProfileId])];

    this.getTyping(dto.id);
  }

  @SubscribeMessage(ChatPathTypes.REMOVE_TYPING)
  removeTyping(@MessageBody() dto: typingDto) {
    this.typing = this.typing.filter(
      (profileId) => profileId !== dto.currentProfileId,
    );

    this.getTyping(dto.id);
  }
}
