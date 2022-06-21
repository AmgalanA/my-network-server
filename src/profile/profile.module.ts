import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { FileModule } from '../file/file.module';
import { ProfileGateway } from './gateways/profile.gateway';
import { Profile } from './models/profile.model';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, ProfileGateway],
  imports: [SequelizeModule.forFeature([Profile]), FileModule],
  exports: [ProfileService],
})
export class ProfileModule {}
