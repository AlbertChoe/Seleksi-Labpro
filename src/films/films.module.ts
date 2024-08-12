import { Module } from '@nestjs/common';
import { FilmsService } from './films.service';
import { ApiFilmsController } from './api-films.controller';
import { WebFilmsController } from './web-films.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudflareR2Module } from '../cloudflare-r2/cloudfare-r2.module'; // Import the module

@Module({
  imports: [PrismaModule, CloudflareR2Module], // Import CloudflareR2Module here
  controllers: [ApiFilmsController, WebFilmsController],
  providers: [FilmsService],
})
export class FilmsModule {}
