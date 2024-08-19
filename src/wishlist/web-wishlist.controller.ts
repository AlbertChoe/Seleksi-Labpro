import {
  Controller,
  Post,
  Get,
  Req,
  Param,
  Logger,
  BadRequestException,
  Res,
  Render,
  Redirect,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { Request, Response } from 'express';

@Controller('wishlist')
export class WishlistController {
  private readonly logger = new Logger(WishlistController.name);

  constructor(private readonly wishlistService: WishlistService) {}

  @Post(':filmId')
  async addToWishlist(
    @Param('filmId') filmId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      this.logger.warn('User not logged in, redirecting to login page');
      return res.redirect('/login');
    }

    try {
      await this.wishlistService.addToWishlist(userId, filmId);
      return res.redirect(`/films/${filmId}`);
    } catch (error) {
      this.logger.error(`Failed to add film to wishlist: ${error.message}`);
      return res.redirect(
        `/films/${filmId}?error=${encodeURIComponent(error.message)}`,
      );
    }
  }

  @Get()
  @Redirect('/login', 302)
  @Render('wishlist')
  async getUserWishlist(@Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) {
      return { url: '/login' };
    }

    const wishlist = await this.wishlistService.getUserWishlist(userId);

    const user = req.user || null;

    return {
      wishlist,
      isLoggedIn: !!user,
      username: user?.username || '',
      balance: user?.balance || 0,
    };
  }
}
