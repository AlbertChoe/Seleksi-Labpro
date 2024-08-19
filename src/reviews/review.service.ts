import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { format } from 'date-fns';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async addReview(
    userId: string,
    filmId: string,
    rating: number,
    comment: string,
  ) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    if (!comment || comment.trim() === '') {
      throw new BadRequestException('Comment cannot be empty');
    }

    const existingReview = await this.prisma.review.findUnique({
      where: { userId_filmId: { userId, filmId } },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this film');
    }

    const review = await this.prisma.review.create({
      data: {
        rating,
        comment,
        userId,
        filmId,
      },
    });

    this.logger.log(`Review added for film ${filmId} by user ${userId}`);

    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
    };
  }

  async getReviewsForFilm(filmId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { filmId },
      include: { user: true },
    });

    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      username: review.user.username,
      createdAt: format(new Date(review.createdAt), 'PPpp'),
    }));
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.userId !== userId) {
      throw new BadRequestException('Review not found or unauthorized');
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    this.logger.log(`Review ${reviewId} deleted by user ${userId}`);

    return { message: 'Review deleted successfully' };
  }
}
