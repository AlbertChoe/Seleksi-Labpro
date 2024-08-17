import { Controller, Get, Render, Req, Query, Logger } from '@nestjs/common';
import { Request } from 'express';
import { FilmsService } from './films/films.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly filmsService: FilmsService) {}

  @Get('')
  @Render('browse')
  @ApiOperation({ summary: 'Render the browse page' })
  @ApiResponse({
    status: 200,
    description: 'Browse page rendered successfully',
  })
  async getBrowsePage(@Req() req: Request, @Query('q') q?: string) {
    this.logger.log(
      `Rendering browse page with search query: ${q || 'no query'}`,
    );

    const films = await this.filmsService.findAll(q);
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
