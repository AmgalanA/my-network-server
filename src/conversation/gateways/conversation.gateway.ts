import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { deleteMessageDto } from 'src/message/dtos/delete-message.dto';
import { sendMessageDto } from 'src/message/dtos/send-message.dto';
import { MessageService } from 'src/message/message.service';
import { ConversationService } from '../conversation.service';
import { conversationDto } from '../dtos/conversation.dto';
import { PathTypes } from './path-types';

@WebSocketGateway(80, { namespace: 'conversation', cors: true })
export class ConversationGateway {
  constructor(
    private conversationService: ConversationService,
    private messageService: MessageService,
  ) {}

  @WebSocketServer()
  server: Server;

  typing: number[] = [];

  async getConversation(@MessageBody() id: number) {
    const conversation = await this.conversationService.getOne(id);

    this.server
      .to(conversation.id.toString())
      .emit(PathTypes.GET_CONVERSATION, conversation);
  }

  async updateConversations(@MessageBody() profileId: number) {
    this.server.to(profileId.toString()).emit(PathTypes.UPDATE_CONVERSATIONS);
  }

  @SubscribeMessage(PathTypes.SEND_MESSAGE)
  async sendMessage(@MessageBody() dto: sendMessageDto) {
    await this.getConversation(dto.id);

    await this.updateConversations(dto.receiverId);
  }

  @SubscribeMessage(PathTypes.DELETE_MESSAGE)
  async deleteMessage(@MessageBody() dto: deleteMessageDto) {
    await this.messageService.delete(dto.messageId);

    await this.getConversation(dto.conversationId);
  }

  @SubscribeMessage(PathTypes.JOIN_ROOM)
  async joinRoom(@MessageBody() id: number, @ConnectedSocket() client: Socket) {
    client.join(id.toString());

    client.emit('joined-room');
  }

  @SubscribeMessage(PathTypes.LEAVE_ROOM)
  async leaveRoom(
    @MessageBody() id: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(id.toString());

    client.emit('left-room');
  }

  getTyping(id: number) {
    this.server.to(id.toString()).emit(PathTypes.GET_TYPING, this.typing);
  }

  @SubscribeMessage(PathTypes.ADD_TYPING)
  addTyping(@MessageBody() dto: conversationDto) {
    this.typing = [...new Set([...this.typing, dto.currentProfileId])];

    this.getTyping(dto.id);
  }

  @SubscribeMessage(PathTypes.REMOVE_TYPING)
  removeTyping(@MessageBody() dto: conversationDto) {
    this.typing = this.typing.filter(
      (profileId) => profileId !== dto.currentProfileId,
    );

    this.getTyping(dto.id);
  }
}
