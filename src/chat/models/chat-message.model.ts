import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Profile } from 'src/profile/models/profile.model';
import { Chat } from './chat.model';

interface messageCreatingAttrs {
  text: string;
  senderId: number;
  sentAt: string;
  images: string[];
  audios: string[];
  videos: string[];
  chatId: number;
}

export enum MessageType {
  ORDINARY = 'ordinary',
  INVITE = 'invite',
}

@Table({ tableName: 'chat-message' })
export class ChatMessage extends Model<ChatMessage, messageCreatingAttrs> {
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

  //   It has message id, if it is an answer
  @ForeignKey(() => ChatMessage)
  @Column({ type: DataType.INTEGER, allowNull: true })
  messageId?: number;

  @ForeignKey(() => Chat)
  chatId: number;
}
