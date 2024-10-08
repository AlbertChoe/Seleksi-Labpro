import {
  Controller,
  Get,
  Render,
  Param,
  Logger,
  UseGuards,
  Req,
  Post,
  Res,
  Query,
} from '@nestjs/common';
import { FilmsService } from './films.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { Request, Response } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from '../wishlist/wishlist.service';
import { ReviewsService } from 'src/reviews/review.service';

@Controller('films')
export class WebFilmsController {
  private readonly logger = new Logger(WebFilmsController.name);

  constructor(
    private readonly filmsService: FilmsService,
    private readonly wishlistService: WishlistService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Get(':id')
  @Render('film-details')
  async getFilmDetailsPage(
    @Param('id') id: string,
    @Req() req: Request,
    @Query('error') error?: string,
  ) {
    this.logger.log(`Rendering film details page for id ${id}`);

    const film = await this.filmsService.findOne(id);
    if (!film) {
      return {
        status: 'error',
        message: 'Film not found',
        data: null,
      };
    }

    const user = req.user || null;

    const isPurchased = user
      ? await this.filmsService.isFilmPurchasedByUser(user.id, id)
      : false;

    const isInWishlist = user
      ? await this.wishlistService.isInWishlist(user.id, id)
      : false;

    const reviews = await this.reviewsService.getReviewsForFilm(id);

    return {
      film,
      isPurchased,
      isInWishlist,
      isLoggedIn: !!user,
      username: user?.username || '',
      balance: user?.balance || 0,
      reviews,
      error,
    };
  }

  @Post(':id/purchase')
  async purchaseFilm(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = req.user;

    if (!user) {
      return res.redirect('/login');
    }

    this.logger.log(`User ${user.id} attempting to purchase film ${id}`);

    const film = await this.filmsService.findOne(id);
    if (!film) {
      this.logger.error('Film not found');
      return res.status(404).json({
        status: 'error',
        message: 'Film not found',
        data: null,
      });
    }

    if (user.balance < film.price) {
      this.logger.error('Insufficient balance');
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient balance',
        data: null,
      });
    }

    await this.filmsService.purchaseFilm(user.id, id, film.price);
    return res.redirect(`/films/${id}`);
  }

  @Get(':id/watch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @Render('film-watch')
  async watchFilm(@Param('id') id: string, @Req() req: Request) {
    const user = req.user;
    this.logger.log(`User ${user.id} attempting to watch film ${id}`);

    const isPurchased = await this.filmsService.isFilmPurchasedByUser(
      user.id,
      id,
    );
    if (!isPurchased) {
      this.logger.error('Film not purchased');
      return {
        status: 'error',
        message: 'Film not purchased',
      };
    }

    const film = await this.filmsService.findOne(id);

    const genres = film.genre.join(', ');

    return {
      film: { ...film, genre: genres },
      isLoggedIn: !!user,
      username: user?.username || '',
      balance: user?.balance || 0,
    };
  }
}
