import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { format } from 'date-fns';
@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);
  private readonly defaultCoverImageUrl =
    'https://pub-5b37e409c44047f8be99633ef99badb5.r2.dev/png-transparent-clap-board-illustration-cinema-film-clapperboard-computer-icons-cine-miscellaneous-television-angle-thumbnail.png';

  constructor(private readonly prisma: PrismaService) {}

  async addToWishlist(userId: string, filmId: string) {
    // Check if the film is already in the user's wishlist
    const existingItem = await this.prisma.wishlist.findUnique({
      where: { userId_filmId: { userId, filmId } },
    });

    if (existingItem) {
      throw new BadRequestException('Film is already in your wishlist');
    }

    const wishlistItem = await this.prisma.wishlist.create({
      data: {
        userId,
        filmId,
      },
    });

    this.logger.log(`Film ${filmId} added to wishlist for user ${userId}`);

    return {
      id: wishlistItem.id,
      filmId: wishlistItem.filmId,
      addedAt: wishlistItem.createdAt,
    };
  }

  async getUserWishlist(userId: string) {
    const wishlist = await this.prisma.wishlist.findMany({
      where: { userId },
      include: { film: true },
    });

    return wishlist.map((item) => ({
      filmId: item.film.id,
      title: item.film.title,
      cover_image_url: item.film.coverImageUrl || this.defaultCoverImageUrl,
      addedAt: format(new Date(item.createdAt), 'PPpp'),
    }));
  }

  async removeFromWishlist(userId: string, filmId: string) {
    const wishlistItem = await this.prisma.wishlist.findUnique({
      where: { userId_filmId: { userId, filmId } },
    });

    if (!wishlistItem) {
      throw new BadRequestException('Film not found in your wishlist');
    }

    await this.prisma.wishlist.delete({
      where: { id: wishlistItem.id },
    });

    this.logger.log(`Film ${filmId} removed from wishlist for user ${userId}`);

    return { message: 'Film removed from wishlist successfully' };
  }

  async isInWishlist(userId: string, filmId: string): Promise<boolean> {
    const wishlistItem = await this.prisma.wishlist.findUnique({
      where: { userId_filmId: { userId, filmId } },
    });

    return !!wishlistItem;
  }
}
