import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';

@Injectable()
export class FilmsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFilmDto: CreateFilmDto) {
    return this.prisma.film.create({ data: createFilmDto });
  }

  async findAll() {
    return this.prisma.film.findMany();
  }

  async findOne(id: number) {
    return this.prisma.film.findUnique({ where: { id } });
  }

  async update(id: number, updateFilmDto: UpdateFilmDto) {
    return this.prisma.film.update({
      where: { id },
      data: updateFilmDto,
    });
  }

  async remove(id: number) {
    return this.prisma.film.delete({ where: { id } });
  }
}
