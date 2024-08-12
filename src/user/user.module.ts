import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiUserController } from './api-user.controller';
import { WebUserController } from './web-user.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApiUserController, WebUserController],
  providers: [UserService],
})
export class UserModule {}
