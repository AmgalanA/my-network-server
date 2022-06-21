import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { Profile } from '../../profile/models/profile.model';
import { Chat } from './chat.model';

@Table({ tableName: 'chat-leaving' })
export class ChatLeaving extends Model<ChatLeaving> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  name: string;

  @ForeignKey(() => Profile)
  @Column({ type: DataType.INTEGER })
  profileId: number;

  @Column({ type: DataType.STRING })
  sentAt: string;

  @ForeignKey(() => Chat)
  @Column({ type: DataType.INTEGER })
  chatId: number;
}
