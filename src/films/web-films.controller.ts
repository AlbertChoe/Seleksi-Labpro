import {
  Controller,
  Get,
  Render,
  Param,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { FilmsService } from './films.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('films')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WebFilmsController {
  private readonly logger = new Logger(WebFilmsController.name);

  constructor(private readonly filmsService: FilmsService) {}

  @Get(':id')
  @Roles(Role.User)
  @Render('film-details')
  async getFilmDetailsPage(@Param('id') id: string) {
    this.logger.log(`Rendering film details page for id ${id}`);
    const film = await this.filmsService.findOne(id);
    if (!film) {
      return {
        status: 'error',
        message: 'Film not found',
        data: null,
      };
    }
    return {
      film,
    };
  }
}
