import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { FileModule } from 'src/file/file.module';
import { MessageModule } from 'src/message/message.module';
import { Profile } from 'src/profile/models/profile.model';
import { TokenModule } from 'src/token/token.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatInvite } from './models/chat-invite.model';
import { ChatLeaving } from './models/chat-leaving.model';
import { ChatMessage } from './models/chat-message.model';
import { Chat } from './models/chat.model';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  imports: [
    SequelizeModule.forFeature([
      Chat,
      ChatMessage,
      Profile,
      ChatInvite,
      ChatLeaving,
    ]),
    FileModule,
    TokenModule,
  ],
  exports: [ChatService],
})
export class ChatModule {}
