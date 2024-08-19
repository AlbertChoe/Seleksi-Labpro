import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Req,
  Logger,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { ReviewsService } from './review.service';
import { Response, Request } from 'express';

@Controller('reviews')
export class ReviewsController {
  private readonly logger = new Logger(ReviewsController.name);

  constructor(private readonly reviewService: ReviewsService) {}

  @Post(':filmId')
  async addReview(
    @Param('filmId') filmId: string,
    @Body('rating') rating: number,
    @Body('comment') comment: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      return res.redirect('/login');
    }

    try {
      await this.reviewService.addReview(userId, filmId, rating, comment);
      return res.redirect(`/films/${filmId}`);
    } catch (error) {
      this.logger.error(
        `Failed to add review for film ${filmId}: ${error.message}`,
      );
      return res.redirect(
        `/films/${filmId}?error=${encodeURIComponent(error.message)}`,
      );
    }
  }

  @Get(':filmId')
  async getReviewsForFilm(@Param('filmId') filmId: string) {
    const reviews = await this.reviewService.getReviewsForFilm(filmId);
    return reviews;
  }
}
