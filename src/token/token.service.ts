import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { payloadDto } from './dtos/payload.dto';
import { Token } from './models/token.model';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(Token) private tokenRepository: typeof Token,
  ) {}

  async generateTokens(payload: payloadDto) {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET || 'access_token_secret',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET || 'refresh_token_secret',
      expiresIn: '12h',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async save(authId: number, refreshToken: string) {
    const tokenData = await this.tokenRepository.findOne({ where: { authId } });

    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      await tokenData.save();

      return tokenData;
    } else {
      const token = await this.tokenRepository.create({
        authId,
        refreshToken,
      });

      return token;
    }
  }

  async findOne(authId: number) {
    const tokenData = await this.tokenRepository.findOne({ where: { authId } });

    if (!tokenData) return null;

    return tokenData;
  }

  async remove(refreshToken: string) {
    const token = await this.tokenRepository.destroy({
      where: { refreshToken },
    });

    if (!token) return null;
    return token;
  }

  async validateRefreshToken(refreshToken: string): Promise<{ id: number }> {
    const data = await this.jwtService.verify(refreshToken, {
      secret: process.env.REFRESH_TOKEN_SECRET || 'refresh_token_secret',
    });

    if (!data) return null;
    return data;
  }

  validateAccessToken(accessToken: string) {
    const data = this.jwtService.verify(accessToken, {
      secret: process.env.ACCESS_TOKEN_SECRET || 'access_token_secret',
    });

    if (!data) return null;
    return data;
  }
}
