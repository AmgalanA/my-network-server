import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MessageModule } from 'src/message/message.module';
import { Message } from 'src/message/models/message.model';
import { TokenModule } from 'src/token/token.module';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { ConversationGateway } from './gateways/conversation.gateway';
import { Conversation } from './models/conversation.model';

@Module({
  controllers: [ConversationController],
  providers: [ConversationService, ConversationGateway],
  imports: [
    SequelizeModule.forFeature([Conversation, Message]),
    forwardRef(() => MessageModule),
    TokenModule,
  ],
  exports: [ConversationService],
})
export class ConversationModule {}
