import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { CloudflareR2Service } from '../cloudflare-r2/cloudflare-r2.service';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';
@Injectable()
export class FilmsService {
  private readonly logger = new Logger(FilmsService.name);
  private readonly defaultCoverImageUrl =
    'https://pub-5b37e409c44047f8be99633ef99badb5.r2.dev/png-transparent-clap-board-illustration-cinema-film-clapperboard-computer-icons-cine-miscellaneous-television-angle-thumbnail.png';

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudflareR2Service: CloudflareR2Service,
  ) {}

  async create(
    createFilmDto: CreateFilmDto,
    video: Express.Multer.File,
    coverImage: Express.Multer.File,
  ) {
    try {
      // Generate unique filenames
      const uniqueVideoFilename = `${uuidv4()}-${video.originalname}`;
      const uniqueCoverImageFilename = coverImage
        ? `${uuidv4()}-${coverImage.originalname}`
        : null;

      this.logger.log('Uploading video file');
      const videoResult = await this.cloudflareR2Service.uploadFileMultipart(
        uniqueVideoFilename,
        video.buffer,
      );
      this.logger.log(`Video uploaded to ${videoResult}`);

      let coverImageResult = null;
      if (coverImage) {
        this.logger.log('Uploading cover image file');
        coverImageResult = await this.cloudflareR2Service.uploadFileMultipart(
          uniqueCoverImageFilename,
          coverImage.buffer,
        );
        this.logger.log(`Cover image uploaded to ${coverImageResult}`);
      }

      this.logger.log('Creating film record in database');
      const film = await this.prisma.film.create({
        data: {
          ...createFilmDto,
          release_year: parseInt(
            createFilmDto.release_year as unknown as string,
            10,
          ),
          genre: Array.isArray(createFilmDto.genre)
            ? createFilmDto.genre
            : [createFilmDto.genre],
          price: parseInt(createFilmDto.price as unknown as string, 10),
          duration: parseInt(createFilmDto.duration as unknown as string, 10),
          videoUrl: videoResult,
          coverImageUrl: coverImageResult || null,
        },
      });
      this.logger.log('Film record created successfully');
      return film;
    } catch (error) {
      this.logger.error(`Error creating film: ${error.message}`);
      throw new Error(`Error creating film: ${error.message}`);
    }
  }

  async findAll(q?: string) {
    this.logger.log('Fetching all films from database');
    let films;
    if (q) {
      films = await this.prisma.film.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { director: { contains: q, mode: 'insensitive' } },
          ],
        },
      });
    } else {
      films = await this.prisma.film.findMany();
    }

    return films.map((film) => ({
      id: film.id,
      title: film.title,
      director: film.director,
      release_year: film.release_year,
      genre: film.genre,
      price: film.price,
      duration: film.duration,
      cover_image_url: film.coverImageUrl || this.defaultCoverImageUrl,
      created_at: film.createdAt.toISOString(),
      updated_at: film.updatedAt.toISOString(),
    }));
  }

  async findAllWithPagination(q?: string, page = 1, limit = 9) {
    this.logger.log(
      `Fetching all films from database, page: ${page}, limit: ${limit}`,
    );

    const skip = (page - 1) * limit;

    let films;
    const where: Prisma.FilmWhereInput = q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { director: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};

    films = await this.prisma.film.findMany({
      where,
      skip,
      take: limit,
    });

    const totalItems = await this.prisma.film.count({ where });
    const totalPages = Math.ceil(totalItems / limit);

    const formattedFilms = films.map((film) => ({
      id: film.id,
      title: film.title,
      director: film.director,
      release_year: film.release_year,
      genre: film.genre,
      price: film.price,
      duration: film.duration,
      cover_image_url: film.coverImageUrl || this.defaultCoverImageUrl,
      created_at: film.createdAt.toISOString(),
      updated_at: film.updatedAt.toISOString(),
    }));

    return {
      films: formattedFilms,
      pagination: {
        currentPage: page,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
      },
    };
  }

  async findOne(id: string) {
    this.logger.log(`Fetching film with id ${id} from database`);
    const film = await this.prisma.film.findUnique({ where: { id } });
    if (!film) return null;

    return {
      id: film.id,
      title: film.title,
      description: film.description,
      director: film.director,
      release_year: film.release_year,
      genre: film.genre,
      price: film.price,
      duration: film.duration,
      video_url: film.videoUrl,
      cover_image_url: film.coverImageUrl || this.defaultCoverImageUrl,
      created_at: film.createdAt.toISOString(),
      updated_at: film.updatedAt.toISOString(),
    };
  }

  async update(
    id: string,
    updateFilmDto: UpdateFilmDto,
    video: Express.Multer.File,
    coverImage: Express.Multer.File,
  ) {
    try {
      this.logger.log(`Updating film with id ${id}`);
      const film = await this.prisma.film.findUnique({
        where: { id },
      });

      let videoUrl = film.videoUrl;
      let coverImageUrl = film.coverImageUrl;

      if (video) {
        this.logger.log('Deleting old video file');
        await this.cloudflareR2Service.deleteFile(videoUrl);
        this.logger.log('Uploading new video file');
        const videoResult = await this.cloudflareR2Service.uploadFileMultipart(
          video.originalname,
          video.buffer,
        );
        videoUrl = videoResult;
      }

      if (coverImage) {
        this.logger.log('Deleting old cover image file');
        await this.cloudflareR2Service.deleteFile(coverImageUrl);
        this.logger.log('Uploading new cover image file');
        const coverImageResult =
          await this.cloudflareR2Service.uploadFileMultipart(
            coverImage.originalname,
            coverImage.buffer,
          );
        coverImageUrl = coverImageResult;
      }

      this.logger.log('Updating film record in database');
      const updatedFilm = await this.prisma.film.update({
        where: { id },
        data: {
          ...updateFilmDto,
          price: parseInt(updateFilmDto.price as unknown as string, 10),
          release_year: parseInt(
            updateFilmDto.release_year as unknown as string,
            10,
          ),
          duration: parseInt(updateFilmDto.duration as unknown as string, 10),
          videoUrl,
          coverImageUrl,
        },
      });
      this.logger.log('Film record updated successfully');
      return updatedFilm;
    } catch (error) {
      this.logger.error('Error updating film', error.stack);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      this.logger.log(`Removing film with id ${id}`);
      const film = await this.prisma.film.findUnique({
        where: { id },
      });
      this.logger.log('Deleting video file');
      await this.cloudflareR2Service.deleteFile(film.videoUrl);
      if (film.coverImageUrl) {
        this.logger.log('Deleting cover image file');
        await this.cloudflareR2Service.deleteFile(film.coverImageUrl);
      }
      this.logger.log('Deleting film record from database');
      const deletedFilm = await this.prisma.film.delete({
        where: { id },
      });
      this.logger.log('Film record deleted successfully');
      return deletedFilm;
    } catch (error) {
      this.logger.error('Error removing film', error.stack);
      throw error;
    }
  }

  async isFilmPurchasedByUser(
    userId: string,
    filmId: string,
  ): Promise<boolean> {
    this.logger.log(`Checking if user ${userId} has purchased film ${filmId}`);
    const purchase = await this.prisma.purchase.findFirst({
      where: {
        userId,
        filmId,
      },
    });
    return !!purchase;
  }

  async purchaseFilm(userId: string, filmId: string, price: number) {
    this.logger.log(`Processing purchase of film ${filmId} by user ${userId}`);

    // Deduct balance
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          decrement: price,
        },
      },
    });

    // Record purchase
    await this.prisma.purchase.create({
      data: {
        userId,
        filmId,
      },
    });

    this.logger.log('Purchase recorded and balance updated');
  }
}
