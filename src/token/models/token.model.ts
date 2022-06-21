import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Auth } from 'src/auth/models/auth.model';

interface TokenCreatingAttrs {
  refreshToken: string;
  authId: number;
}

@Table({ tableName: 'token' })
export class Token extends Model<Token, TokenCreatingAttrs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
  })
  id: number;

  @Column({ type: DataType.STRING(1000) })
  refreshToken: string;

  @ForeignKey(() => Auth)
  @Column({ type: DataType.INTEGER })
  authId: number;
}
