import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { Auth } from 'src/auth/models/auth.model';
import { Token } from './models/token.model';
import { TokenService } from './token.service';

@Module({
  providers: [TokenService],
  imports: [JwtModule.register({}), SequelizeModule.forFeature([Auth, Token])],
  exports: [TokenService],
})
export class TokenModule {}
