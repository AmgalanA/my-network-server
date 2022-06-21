import {
  Table,
  Model,
  Column,
  DataType,
  HasMany,
  ForeignKey,
} from 'sequelize-typescript';

import { Comment } from '../../comment/models/comment.model';
import { Profile } from '../../profile/models/profile.model';

interface postCreatingAttrs {
  text?: string;
  senderId: number;
  groupId?: number;
  images: string[];
  audios: string[];
  videos: string[];
  postedAt: string;
}

@Table({ tableName: 'post' })
export class Post extends Model<Post, postCreatingAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: true })
  text: string;

  @ForeignKey(() => Profile)
  @Column({ type: DataType.INTEGER })
  senderId: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  groupId: number;

  @Column({ type: DataType.ARRAY(DataType.INTEGER), defaultValue: [] })
  likes: number[];

  @HasMany(() => Comment)
  comments: Comment[];

  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  images: string[];

  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  audios: string[];

  @Column({ type: DataType.ARRAY(DataType.STRING), defaultValue: [] })
  videos: string[];

  @Column({ type: DataType.STRING })
  postedAt: string;
}
