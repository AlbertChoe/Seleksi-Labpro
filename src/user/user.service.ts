import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
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
}
