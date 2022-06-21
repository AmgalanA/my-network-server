import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const authHeader = request.headers.authorization;

      const accessToken = authHeader.split(' ')[1];
      const tokenData = this.tokenService.validateAccessToken(accessToken);

      request.user = tokenData;

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
