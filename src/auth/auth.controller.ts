import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { createAuthDto } from './dtos/create-auth.dto';
import { loginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() authDto: createAuthDto) {
    return this.authService.register(authDto);
  }

  @Post('login')
  login(@Body() loginDto: loginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  logout(@Body() { token }: { token: string }) {
    return this.authService.logout(token);
  }

  @Post('refresh')
  refresh(@Body() { token }: { token: string }) {
    return this.authService.refresh(token);
  }
}
