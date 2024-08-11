import { Controller, Get, Render, Req } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from './prisma/prisma.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('')
  @Render('browse')
  @ApiOperation({ summary: 'Render the browse page' })
  @ApiResponse({
    status: 200,
    description: 'browse page rendered successfully',
  })
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
}
