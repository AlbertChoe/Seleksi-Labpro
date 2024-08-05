import { Controller, Get, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('')
  @Render('browse')
  async getBrowsePage(@Req() req: Request) {
    const films = await this.prisma.film.findMany();
    const user = req.user || null;

    return {
      isLoggedIn: !!user,
      username: user?.username || '',
      balance: user?.balance || 0,
      films,
      hasPrev: false,
      hasNext: false,
      prevPage: 0,
      nextPage: 2,
    };
  }

  @Get('my-list')
  @Render('my-list')
  async getMyListPage(@Req() req: Request) {
    const user = req.user || null;
    const purchases = user
      ? await this.prisma.purchase.findMany({
          where: { userId: user.id },
          include: { film: true },
        })
      : [];

    return {
      isLoggedIn: !!user,
      username: user?.username || '',
      balance: user?.balance || 0,
      purchases,
    };
  }
}
