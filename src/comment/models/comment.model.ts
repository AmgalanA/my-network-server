import {
  Table,
  Model,
  Column,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';

import { Profile } from '../../profile/models/profile.model';
import { Post } from '../../post/models/post.model';

interface commentCreatingAttrs {
  text: string;
  senderId: number;
  postId: number;
  sentAt: string;
}

@Table({ tableName: 'comment' })
export class Comment extends Model<Comment, commentCreatingAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  text: string;

  @Column({ type: DataType.STRING })
  sentAt: string;

  @ForeignKey(() => Profile)
  @Column({ type: DataType.INTEGER })
  senderId: number;

  @ForeignKey(() => Post)
  @Column({ type: DataType.INTEGER })
  postId: number;

  @Column({ type: DataType.ARRAY(DataType.INTEGER), defaultValue: [] })
  likes: number[];
}
