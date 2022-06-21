import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { TokenModule } from './token/token.module';
import { FileModule } from './file/file.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, 'static'),
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [],
      autoLoadModels: true,
    }),
    AuthModule,
    ProfileModule,
    TokenModule,
    FileModule,
    PostModule,
    CommentModule,
    ConversationModule,
    MessageModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
