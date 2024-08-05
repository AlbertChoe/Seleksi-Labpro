import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.user) {
      const user = await this.prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (user) {
        req.user.balance = user.balance;
      } else {
        req.user.balance = 0;
      }
    }
    next();
  }
}
