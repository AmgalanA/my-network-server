import {
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';

import { Profile } from 'src/profile/models/profile.model';
import { ChatInvite } from './chat-invite.model';
import { ChatLeaving } from './chat-leaving.model';
import { ChatMessage } from './chat-message.model';

interface ChatCreatingAttrs {
  name: string;
  description: string;
  avatar: string;
  creatorId: number;
}

@Table({ tableName: 'chat' })
export class Chat extends Model<Chat, ChatCreatingAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  name: string;

  @Column({ type: DataType.STRING })
  description: string;

  @Column({ type: DataType.ARRAY(DataType.INTEGER), defaultValue: [] })
  members: number[];

  @Column({ type: DataType.ARRAY(DataType.INTEGER), defaultValue: [] })
  admins: number[];

  @Column({ type: DataType.STRING })
  avatar: string;

  @ForeignKey(() => Profile)
  @Column({ type: DataType.INTEGER })
  creatorId: number;

  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  images: string[];

  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  audios: string[];

  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  videos: string[];

  @HasMany(() => ChatMessage)
  messages: ChatMessage[];

  @HasMany(() => ChatInvite)
  invites: ChatInvite[];

  @HasMany(() => ChatLeaving)
  leavings: ChatLeaving[];
}
