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
  Render,
  Req,
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
import { Request } from 'express';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

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

  @Get('my-list')
  @Render('my-list')
  @ApiOperation({
    summary: "Retrieve user's list page",
    description:
      "Fetches the user's purchase list and associated film details if the user is logged in.",
  })
  @ApiResponse({
    status: 200,
    description: 'Successful response',
    schema: {
      type: 'object',
      properties: {
        isLoggedIn: {
          type: 'boolean',
          description: 'Indicates if the user is logged in',
        },
        username: {
          type: 'string',
          description: 'Username of the logged-in user',
        },
        balance: { type: 'number', description: 'Account balance of the user' },
        purchases: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer', description: 'Purchase ID' },
              userId: { type: 'integer', description: 'User ID' },
              filmId: { type: 'integer', description: 'Film ID' },
              film: {
                type: 'object',
                properties: {
                  id: { type: 'integer', description: 'Film ID' },
                  title: { type: 'string', description: 'Title of the film' },
                  description: {
                    type: 'string',
                    description: 'Description of the film',
                  },
                  releaseDate: {
                    type: 'string',
                    format: 'date',
                    description: 'Release date of the film',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, user not logged in',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
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
