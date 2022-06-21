import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Profile } from 'src/profile/models/profile.model';
import { ProfileModule } from 'src/profile/profile.module';
import { TokenModule } from 'src/token/token.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Auth } from './models/auth.model';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [SequelizeModule.forFeature([Auth]), ProfileModule, TokenModule],
})
export class AuthModule {}
