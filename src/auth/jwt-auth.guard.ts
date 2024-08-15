import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const token = request.cookies?.token;

    if (token) {
      request.headers.authorization = `Bearer ${token}`;
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    const request = context.switchToHttp().getRequest();

    request.user = {
      ...request.user,
      ...user,
    };

    return request.user;
  }
}
