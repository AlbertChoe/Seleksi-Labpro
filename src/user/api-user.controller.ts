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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('api-users')
@ApiBearerAuth()
@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApiUserController {
  private readonly logger = new Logger(ApiUserController.name);

  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get list of users' })
  @ApiResponse({
    status: 200,
    description: 'Users fetched successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Users fetched successfully',
        data: [
          {
            id: '1',
            username: 'user1',
            email: 'user1@example.com',
            balance: 100,
          },
        ],
      },
    },
  })
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
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User fetched successfully',
    schema: {
      example: {
        status: 'success',
        message: 'User fetched successfully',
        data: {
          id: '1',
          username: 'user1',
          email: 'user1@example.com',
          balance: 100,
        },
      },
    },
  })
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
  @ApiOperation({ summary: 'Update user balance' })
  @ApiResponse({
    status: 200,
    description: 'User balance updated successfully',
    schema: {
      example: {
        status: 'success',
        message: 'User balance updated successfully',
        data: {
          id: '1',
          username: 'user1',
          email: 'user1@example.com',
          balance: 150,
        },
      },
    },
  })
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
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: {
      example: {
        status: 'success',
        message: 'User deleted successfully',
        data: {
          id: '1',
          username: 'user1',
          email: 'user1@example.com',
          balance: 0,
        },
      },
    },
  })
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
