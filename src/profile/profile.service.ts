import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { FileService, FileType } from '../file/file.service';
import { createProfileDto } from './dtos/create-profile.dto';
import { ProfileDto } from './dtos/profile.dto';
import { toggleFriendsDto } from './dtos/toggle-friends.dto';
import { Profile } from './models/profile.model';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile) private profileRepository: typeof Profile,
    private fileService: FileService,
  ) {}

  async create(profileDto: createProfileDto) {
    const lastSeen = new Date(Date.now()).getTime().toString();
    const profile = await this.profileRepository.create({
      ...profileDto,
      lastSeen,
    });

    return profile;
  }

  async getByAuthId(authId: number) {
    const profile = await this.profileRepository.findOne({ where: { authId } });

    if (!profile) return null;
    return profile;
  }

  async getOne(id: number) {
    const profile = await this.profileRepository.findOne({
      where: { id },
      include: { all: true },
    });

    if (!profile) return null;

    return profile;
  }

  async update(profileDto: ProfileDto, avatar: Express.Multer.File) {
    const profile = await this.getOne(profileDto.id);

    profile.name = profileDto.name;
    profile.secondName = profileDto.secondName;
    profile.sex = profileDto.sex;
    profile.from = profileDto.from;
    profile.birthDate = profileDto.birthDate;
    profile.maritalStatus = profileDto.maritalStatus;

    if (avatar) {
      const filename = this.fileService.createFile(FileType.AVATAR, avatar);

      profile.avatar = filename;
    }

    await profile.save();

    return profile;
  }

  async toggleFriends(toggleFriendsDto: toggleFriendsDto) {
    const currentProfile = await this.getOne(toggleFriendsDto.currentProfileId);

    const profile = await this.getOne(toggleFriendsDto.profileId);

    if (!currentProfile.friends.includes(toggleFriendsDto.profileId)) {
      currentProfile.friends = [
        ...currentProfile.friends,
        toggleFriendsDto.profileId,
      ];

      profile.friends = [...profile.friends, toggleFriendsDto.currentProfileId];
    } else {
      currentProfile.friends = currentProfile.friends.filter(
        (friendId) => friendId !== toggleFriendsDto.profileId,
      );

      profile.friends = profile.friends.filter(
        (friendId) => friendId !== toggleFriendsDto.currentProfileId,
      );
    }

    await currentProfile.save();
    await profile.save();

    return {
      currentProfile,
      profile,
    };
  }

  async searchProfile(searchTerm: string, limit?: number) {
    const profiles = await this.profileRepository.findAll({
      limit,
      where: {
        [Op.or]: {
          name: {
            [Op.or]: [].concat(searchTerm),
          },
          secondName: {
            [Op.or]: [].concat(searchTerm),
          },
        },
      },
    });

    return profiles;
  }

  async updateLastSeen(id: number) {
    const profile = await this.getOne(id);

    profile.lastSeen = new Date(Date.now()).getTime().toString();

    await profile.save();

    return profile;
  }

  async fetchFriends(id: number) {
    const profile = await this.getOne(id);

    const friends = await Promise.all(
      profile.friends.map(async (friendId) => {
        const friend = await this.getOne(friendId);

        return friend;
      }),
    );

    return friends;
  }
}
