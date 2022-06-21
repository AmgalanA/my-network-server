import { Table, Model, Column, DataType, HasMany } from 'sequelize-typescript';
import { Message } from 'src/message/models/message.model';

interface conversationCreatingAttrs {
  ids: number[];
}

@Table({ tableName: 'conversation' })
export class Conversation extends Model<
  Conversation,
  conversationCreatingAttrs
> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
  })
  id: number;

  @Column({ type: DataType.ARRAY(DataType.INTEGER) })
  ids: number[];

  @HasMany(() => Message)
  messages: number[];
}
