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
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { FilmsService } from './films.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('/api/films')
@ApiBearerAuth()
@Controller('api/films')
export class ApiFilmsController {
  private readonly logger = new Logger(ApiFilmsController.name);

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
  @ApiOperation({ summary: 'Create a new film' })
  @ApiResponse({ status: 201, description: 'Film created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({
    description: 'Film data to create',
    type: CreateFilmDto,
  })
  async create(
    @Body() createFilmDto: CreateFilmDto,
    @UploadedFiles()
    files: {
      video?: Express.Multer.File[];
      cover_image?: Express.Multer.File[];
    },
    @Res() res: Response,
  ) {
    try {
      const video = files.video ? files.video[0] : null;
      const coverImage = files.cover_image ? files.cover_image[0] : null;
      this.logger.log('Entered create method');
      this.logger.log(`Video file received: ${video}`);
      this.logger.log(`Image file received: ${coverImage}`);

      const film = await this.filmsService.create(
        createFilmDto,
        video,
        coverImage,
      );
      return res.status(HttpStatus.CREATED).json({
        status: 'success',
        message: 'Film created successfully',
        data: film,
      });
    } catch (error) {
      this.logger.error('Error creating film', error.stack);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'error',
        message: 'Bad request',
        data: null,
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all films' })
  @ApiResponse({ status: 200, description: 'Films fetched successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search query for films',
    type: String,
  })
  async findAll(@Query('q') q: string, @Res() res: Response) {
    try {
      this.logger.log('Fetching all films');
      const films = await this.filmsService.findAll(q);
      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Films fetched successfully',
        data: films,
      });
    } catch (error) {
      this.logger.error('Error fetching films', error.stack);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'error',
        message: 'Bad request',
        data: null,
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a film by id' })
  @ApiResponse({ status: 200, description: 'Film fetched successfully' })
  @ApiResponse({ status: 404, description: 'Film not found' })
  @ApiParam({ name: 'id', type: String, description: 'Film ID' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      this.logger.log(`Fetching film with id ${id}`);
      const film = await this.filmsService.findOne(id);
      if (!film) {
        return res.status(HttpStatus.NOT_FOUND).json({
          status: 'error',
          message: 'Film not found',
          data: null,
        });
      }
      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Film fetched successfully',
        data: film,
      });
    } catch (error) {
      this.logger.error('Error fetching film', error.stack);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'error',
        message: 'Bad request',
        data: null,
      });
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Update a film by id' })
  @ApiResponse({ status: 200, description: 'Film updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Film not found' })
  @ApiParam({ name: 'id', type: String, description: 'Film ID' })
  @ApiBody({
    description: 'Film data to update',
    type: UpdateFilmDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateFilmDto: UpdateFilmDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Res() res: Response,
  ) {
    try {
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
      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Film updated successfully',
        data: film,
      });
    } catch (error) {
      this.logger.error('Error updating film', error.stack);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'error',
        message: 'Bad request',
        data: null,
      });
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete a film by id' })
  @ApiResponse({ status: 200, description: 'Film deleted successfully' })
  @ApiResponse({ status: 404, description: 'Film not found' })
  @ApiParam({ name: 'id', type: String, description: 'Film ID' })
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      this.logger.log(`Deleting film with id ${id}`);
      await this.filmsService.remove(id);
      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Film deleted successfully',
        data: null,
      });
    } catch (error) {
      this.logger.error('Error deleting film', error.stack);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'error',
        message: 'Bad request',
        data: null,
      });
    }
  }
}
