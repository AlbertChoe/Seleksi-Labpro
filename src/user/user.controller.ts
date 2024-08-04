import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { UserService } from './user.service';
import { UpdateBalanceDto } from './dto/update-balance.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(Role.Admin)
  async getUsers(@Query('q') q: string) {
    const users = await this.userService.findAll(q);
    return {
      status: 'success',
      message: 'Users fetched successfully',
      data: users.map((user) => ({
        ...user,
      })),
    };
  }

  @Get(':id')
  @Roles(Role.Admin)
  async getUser(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return {
      status: 'success',
      message: 'User fetched successfully',
      data: {
        ...user,
      },
    };
  }

  @Post(':id/balance')
  @Roles(Role.Admin)
  async updateBalance(
    @Param('id') id: string,
    @Body() updateBalanceDto: UpdateBalanceDto,
  ) {
    const user = await this.userService.updateBalance(
      id,
      updateBalanceDto.increment,
    );
    return {
      status: 'success',
      message: 'User balance updated successfully',
      data: {
        ...user,
      },
    };
  }

  @Delete(':id')
  @Roles(Role.Admin)
  async deleteUser(@Param('id') id: string) {
    const user = await this.userService.remove(id);
    return {
      status: 'success',
      message: 'User deleted successfully',
      data: {
        ...user,
      },
    };
  }
}
