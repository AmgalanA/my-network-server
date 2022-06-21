import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ProfileDto } from './dtos/profile.dto';
import { toggleFriendsDto } from './dtos/toggle-friends.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get('get-one/:id')
  getOne(@Param('id') id: number) {
    return this.profileService.getOne(id);
  }

  @HttpCode(200)
  @Put('/update')
  @UseInterceptors(FileInterceptor('avatar'))
  update(
    @Body() profileDto: ProfileDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    return this.profileService.update(profileDto, avatar);
  }

  @HttpCode(200)
  @Put('toggle-friends')
  toggleFriends(@Body() toggleFriendsDto: toggleFriendsDto) {
    return this.profileService.toggleFriends(toggleFriendsDto);
  }

  @HttpCode(200)
  @Get('search')
  search(
    @Query('searchQuery') searchQuery: string,
    @Query('limit') limit: number,
  ) {
    return this.profileService.searchProfile(searchQuery, limit);
  }

  @HttpCode(200)
  @Get('fetch-friends/:id')
  fetchFriends(@Param('id') id: number) {
    return this.profileService.fetchFriends(id);
  }
}
