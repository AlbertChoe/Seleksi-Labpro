import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { format } from 'date-fns';

@Injectable()
export class UserService {
  private readonly defaultCoverImageUrl =
    'https://pub-5b37e409c44047f8be99633ef99badb5.r2.dev/png-transparent-clap-board-illustration-cinema-film-clapperboard-computer-icons-cine-miscellaneous-television-angle-thumbnail.png';

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: string) {
    return this.prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        balance: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        balance: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateBalance(id: string, increment: number) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        balance: {
          increment,
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        balance: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async remove(id: string) {
    const user = await this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        balance: true,
      },
    });
    return user;
  }

  async getUserPurchases(userId: string) {
    const purchases = await this.prisma.purchase.findMany({
      where: { userId },
      include: { film: true },
    });

    return purchases.map((purchase) => ({
      id: purchase.id,
      filmId: purchase.film.id,
      title: purchase.film.title,
      cover_image_url: purchase.film.coverImageUrl || this.defaultCoverImageUrl,
      description: purchase.film.description,
      director: purchase.film.director,
      purchasedAt: format(new Date(purchase.createdAt), 'PPpp'),
    }));
  }
}
