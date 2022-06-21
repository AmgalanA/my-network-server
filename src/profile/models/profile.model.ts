import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Auth } from 'src/auth/models/auth.model';
import { IMaritalStatus, ISex } from './profile-types';

interface ProfileCreatingAttrs {
  name: string;
  secondName: string;
  authId: number;
  lastSeen: string;
}

@Table({ tableName: 'profile' })
export class Profile extends Model<Profile, ProfileCreatingAttrs> {
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
  secondName: string;

  @Column({ type: DataType.STRING, defaultValue: ISex.NO })
  sex: ISex;

  @Column({ type: DataType.STRING, defaultValue: '' })
  from: string;

  @Column({ type: DataType.STRING, defaultValue: '' })
  birthDate: string;

  @Column({ type: DataType.STRING, defaultValue: IMaritalStatus.NO })
  maritalStatus: IMaritalStatus;

  @Column({ type: DataType.STRING })
  lastSeen: string;

  @Column({ type: DataType.STRING, defaultValue: '' })
  avatar: string;

  @ForeignKey(() => Auth)
  @Column({ type: DataType.INTEGER })
  authId: number;

  @Column({ type: DataType.ARRAY(DataType.INTEGER), defaultValue: [] })
  friends: number[];
}
