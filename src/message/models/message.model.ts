import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Chat } from 'src/chat/models/chat.model';
import { Conversation } from 'src/conversation/models/conversation.model';
import { Profile } from 'src/profile/models/profile.model';

interface messageCreatingAttrs {
  text: string;
  senderId: number;
  sentAt: string;
  conversationId?: number;
  messageId?: number;
  images: string[];
  audios: string[];
  videos: string[];
}

@Table({ tableName: 'message' })
export class Message extends Model<Message, messageCreatingAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  text: string;

  @ForeignKey(() => Profile)
  @Column({ type: DataType.INTEGER })
  senderId: number;

  @Column({ type: DataType.STRING })
  sentAt: string;

  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  images: string[];

  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  audios: string[];

  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  videos: string[];

  @ForeignKey(() => Conversation)
  @Column({ type: DataType.INTEGER, allowNull: true })
  conversationId?: number;

  //   It has message id, if it is an answer
  @ForeignKey(() => Message)
  @Column({ type: DataType.INTEGER, allowNull: true })
  messageId?: number;
}
