import { Module } from '@nestjs/common';
import { FilmsService } from './films.service';
import { ApiFilmsController } from './api-films.controller';
import { WebFilmsController } from './web-films.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudflareR2Module } from '../cloudflare-r2/cloudfare-r2.module';
import { WishlistModule } from 'src/wishlist/wishlist.module';
import { ReviewsModule } from 'src/reviews/review.module';

@Module({
  imports: [PrismaModule, CloudflareR2Module, WishlistModule, ReviewsModule],
  controllers: [ApiFilmsController, WebFilmsController],
  providers: [FilmsService],
  exports: [FilmsService],
})
export class FilmsModule {}
