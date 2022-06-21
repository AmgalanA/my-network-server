import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';
import { Profile } from 'src/profile/models/profile.model';
import { ProfileService } from 'src/profile/profile.service';
import { TokenService } from 'src/token/token.service';

import { createAuthDto } from './dtos/create-auth.dto';
import { loginDto } from './dtos/login.dto';
import { Auth } from './models/auth.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth) private authRepository: typeof Auth,
    private profileService: ProfileService,
    private tokenService: TokenService,
  ) {}

  async register(authDto: createAuthDto) {
    const candidate = await this.authRepository.findOne({
      where: { email: authDto.email },
    });
    if (candidate) {
      throw new HttpException(
        `User with email: ${authDto.email} already registered.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashPassword = await bcrypt.hash(authDto.password, 5);

    const user = await this.authRepository.create({
      email: authDto.email,
      password: hashPassword,
    });

    const profile = await this.profileService.create({
      name: authDto.name,
      secondName: authDto.secondName,
      authId: user.id,
    });

    user.profileId = profile.id;
    await user.save();

    const tokens = await this.handleTokens(user.id, user.email);

    return {
      tokens: { ...tokens },
      profile,
    };
  }

  async login(loginDto: loginDto) {
    const user = await this.authRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new HttpException(
        `User with email: ${loginDto.email} is not registered.`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPassEquals = await bcrypt.compare(loginDto.password, user.password);

    if (!isPassEquals) {
      throw new HttpException(`Incorrect password.`, HttpStatus.BAD_REQUEST);
    }

    const profile = await this.profileService.getByAuthId(user.id);

    if (!profile) {
      throw new HttpException(
        `No profile with id: ${user.id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const tokens = await this.handleTokens(user.id, user.email);

    return {
      tokens: { ...tokens },
      profile,
    };
  }

  async logout(refreshToken: string) {
    const token = await this.tokenService.remove(refreshToken);

    return token;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new HttpException(`Not authorized.`, HttpStatus.UNAUTHORIZED);
    }

    const tokenData = await this.tokenService.validateRefreshToken(
      refreshToken,
    );
    const authData = await this.tokenService.findOne(tokenData.id);

    if (!tokenData || !authData) {
      throw new HttpException(`Not authorized.`, HttpStatus.UNAUTHORIZED);
    }

    const user = await this.getOne(authData.id);

    if (!user) {
      throw new HttpException(`Not authorized.`, HttpStatus.UNAUTHORIZED);
    }

    const tokens = await this.handleTokens(user.id, user.email);

    const profile = await this.profileService.getByAuthId(user.id);

    if (!profile) {
      throw new HttpException(
        `No profile with id: ${user.id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      tokens: { ...tokens },
      profile,
    };
  }

  async getOne(id: number) {
    const user = await this.authRepository.findOne({ where: { id } });

    if (!user) return null;
    return user;
  }

  async handleTokens(id: number, email: string) {
    const payload = {
      id: id,
      email: email,
    };
    const tokens = await this.tokenService.generateTokens(payload);

    await this.tokenService.save(id, tokens.refreshToken);

    return tokens;
  }
}
