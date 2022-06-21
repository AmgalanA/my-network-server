import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatModule } from 'src/chat/chat.module';
import { ConversationModule } from 'src/conversation/conversation.module';
import { Conversation } from 'src/conversation/models/conversation.model';
import { FileModule } from 'src/file/file.module';
import { MessageService } from './message.service';
import { Message } from './models/message.model';

@Module({
  providers: [MessageService],
  imports: [
    SequelizeModule.forFeature([Message, Conversation]),
    forwardRef(() => ConversationModule),
    FileModule,
  ],
  exports: [MessageService],
})
export class MessageModule {}
