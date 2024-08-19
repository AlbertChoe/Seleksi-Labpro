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
  async getBrowsePage(
    @Req() req: Request,
    @Query('q') q?: string,
    @Query('page') page = '1',
  ) {
    this.logger.log(
      `Rendering browse page with search query: ${q || 'no query'}, page: ${page}`,
    );

    const pageNumber = parseInt(page, 10);

    const { films, pagination } = await this.filmsService.findAllWithPagination(
      q,
      pageNumber,
    );

    const user = req.user || null;

    const pages = Array.from(
      { length: pagination.totalPages },
      (_, i) => i + 1,
    );

    return {
      isLoggedIn: !!user,
      username: user?.username || '',
      balance: user?.balance || 0,
      films,
      hasPrev: pagination.hasPrev,
      hasNext: pagination.hasNext,
      prevPage: pagination.prevPage,
      nextPage: pagination.nextPage,
      query: q,
      pages,
      currentPage: pagination.currentPage,
    };
  }

  @Get('404')
  @Render('404')
  notFound() {
    return {};
  }
}
