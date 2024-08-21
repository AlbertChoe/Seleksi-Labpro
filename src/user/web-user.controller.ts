import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WebUserController {
  constructor(private readonly userService: UserService) {}

  @Get('my-list')
  @Render('my-list')
  async getMyListPage(@Req() req: Request) {
    const user = req.user || null;
    const purchases = user
      ? await this.userService.getUserPurchases(user.id)
      : [];

    return {
      isLoggedIn: !!user,
      username: user?.username || '',
      balance: user?.balance || 0,
      purchases,
    };
  }
}
