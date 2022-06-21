import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Profile } from 'src/profile/models/profile.model';
import { Chat } from './chat.model';

interface chatInviteCreatingAttrs {
  toName: string;
  fromName: string;
  toId: number;
  fromId: number;
  chatId: number;
  sentAt: string;
}

@Table({ tableName: 'chat-invite' })
export class ChatInvite extends Model<ChatInvite, chatInviteCreatingAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  toName: string;

  @Column({ type: DataType.STRING })
  fromName: string;

  @ForeignKey(() => Profile)
  @Column({ type: DataType.INTEGER })
  toId: number;

  @ForeignKey(() => Profile)
  @Column({ type: DataType.INTEGER })
  fromId: number;

  @ForeignKey(() => Chat)
  @Column({ type: DataType.INTEGER })
  chatId: number;

  @Column({ type: DataType.STRING })
  sentAt: string;
}
