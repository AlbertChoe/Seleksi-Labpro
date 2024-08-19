import { Module } from '@nestjs/common';
import { ReviewsService } from './review.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ReviewsController } from './web-review.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
