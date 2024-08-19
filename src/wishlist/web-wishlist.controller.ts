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
      throw new BadRequestException('You must be logged in to add to wishlist');
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
  @Render('wishlist')
  async getUserWishlist(@Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException(
        'You must be logged in to view your wishlist',
      );
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
