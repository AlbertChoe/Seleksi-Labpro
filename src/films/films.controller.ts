import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  Logger,
  UploadedFile,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { FilmsService } from './films.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('films')
export class FilmsController {
  private readonly logger = new Logger(FilmsController.name);

  constructor(private readonly filmsService: FilmsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'video', maxCount: 1 },
      { name: 'cover_image', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createFilmDto: CreateFilmDto,
    @UploadedFiles()
    files: {
      video?: Express.Multer.File[];
      cover_image?: Express.Multer.File[];
    },
  ) {
    const video = files.video ? files.video[0] : null;
    const coverImage = files.cover_image ? files.cover_image[0] : null;
    this.logger.log('Entered create method');
    this.logger.log(`Video file received: ${video}`);
    this.logger.log(`Image file received: ${coverImage}`);
    // this.logger.log(`Video file received: ${video ? video.filename : 'none'}`);
    // this.logger.log(
    //   `Cover image file received: ${coverImage ? coverImage.filename : 'none'}`,
    // );

    const film = await this.filmsService.create(
      createFilmDto,
      video,
      coverImage,
    );
    return {
      status: 'success',
      message: 'Film created successfully',
      data: film,
    };
  }

  @Get()
  findAll() {
    this.logger.log('Fetching all films');
    return this.filmsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching film with id ${id}`);
    const film = await this.filmsService.findOne(id);
    return {
      status: 'success',
      message: 'Film fetched successfully',
      data: film,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @UseInterceptors(FilesInterceptor('files'))
  async update(
    @Param('id') id: string,
    @Body() updateFilmDto: UpdateFilmDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    this.logger.log(`Updating film with id ${id}`);
    const video = files
      ? files.find((file) => file.fieldname === 'video')
      : null;
    const coverImage = files
      ? files.find((file) => file.fieldname === 'coverImage')
      : null;
    const film = await this.filmsService.update(
      id,
      updateFilmDto,
      video,
      coverImage,
    );
    return {
      status: 'success',
      message: 'Film updated successfully',
      data: film,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async remove(@Param('id') id: string) {
    this.logger.log(`Deleting film with id ${id}`);
    await this.filmsService.remove(id);
    return {
      status: 'success',
      message: 'Film deleted successfully',
      data: null,
    };
  }
}
