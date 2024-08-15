import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

@Injectable()
export class UserMiddleware implements NestMiddleware {
  private readonly logger = new Logger(UserMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    this.logger.log('User Middleware - Entering Middleware');

    const token =
      req.cookies?.token || req.headers.authorization?.split(' ')[1];
    this.logger.log(`User Middleware - Cookies: ${JSON.stringify(token)}`);

    if (token) {
      try {
        const decodedToken = jwt.verify(
          token,
          process.env.JWT_SECRET || 'secretKey',
        ) as JwtPayload;

        const user = await this.prisma.user.findUnique({
          where: { id: decodedToken.userId },
        });

        if (user) {
          req.user = Object.freeze({
            id: user.id,
            username: user.username,
            balance: user.balance,
            role: user.role,
          });

          this.logger.log(
            `User Middleware - User: ${JSON.stringify(req.user)}`,
          );
        } else {
          this.logger.warn('User Middleware - User not found');
        }
      } catch (error) {
        this.logger.error('User Middleware - Error verifying token:', error);
      }
    } else {
      this.logger.warn(
        'User Middleware - No token found in cookies or headers',
      );
    }
    next();
  }
}
