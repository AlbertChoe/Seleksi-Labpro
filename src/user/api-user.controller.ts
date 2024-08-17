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
  Res,
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
import { Response } from 'express';

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
  @ApiResponse({ status: 400, description: 'Bad request' })
  async getUsers(@Query('q') q: string, @Res() res: Response) {
    try {
      const users = await this.userService.findAll(q);
      return res.status(200).json({
        status: 'success',
        message: 'Users fetched successfully',
        data: users.map((user) => ({
          ...user,
        })),
      });
    } catch (error) {
      this.logger.error('Failed to fetch users', error.stack);
      return res.status(400).json({
        status: 'error',
        message: 'Failed to fetch users',
        data: null,
      });
    }
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
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id') id: string, @Res() res: Response) {
    try {
      const user = await this.userService.findOne(id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
          data: null,
        });
      }
      return res.status(200).json({
        status: 'success',
        message: 'User fetched successfully',
        data: {
          ...user,
        },
      });
    } catch (error) {
      this.logger.error('Failed to fetch user', error.stack);
      return res.status(400).json({
        status: 'error',
        message: 'Failed to fetch user',
        data: null,
      });
    }
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
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateBalance(
    @Param('id') id: string,
    @Body() updateBalanceDto: UpdateBalanceDto,
    @Res() res: Response,
  ) {
    try {
      const user = await this.userService.updateBalance(
        id,
        updateBalanceDto.increment,
      );
      return res.status(200).json({
        status: 'success',
        message: 'User balance updated successfully',
        data: {
          ...user,
        },
      });
    } catch (error) {
      this.logger.error('Failed to update balance', error.stack);
      return res.status(400).json({
        status: 'error',
        message: 'Failed to update balance',
        data: null,
      });
    }
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
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string, @Res() res: Response) {
    try {
      const user = await this.userService.remove(id);
      return res.status(200).json({
        status: 'success',
        message: 'User deleted successfully',
        data: {
          ...user,
        },
      });
    } catch (error) {
      this.logger.error('Failed to delete user', error.stack);
      return res.status(400).json({
        status: 'error',
        message: 'Failed to delete user',
        data: null,
      });
    }
  }
}
