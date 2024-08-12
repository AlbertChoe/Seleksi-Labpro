import {
  Controller,
  Post,
  Body,
  Res,
  Logger,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('api-auth')
@Controller('api')
export class ApiAuthController {
  private readonly logger = new Logger(ApiAuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and get JWT token' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User authenticated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const token = await this.authService.login(loginDto);
      this.logger.log('Login successful, returning token');
      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          username: loginDto.username,
          token: token,
        },
      });
    } catch (error) {
      this.logger.error('Login failed', error.stack);
      res.status(400).json({
        status: 'error',
        message: 'Login failed',
        data: null,
      });
    }
  }

  @Get('self')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get profile of the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'User profile fetched successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Req() req: Request) {
    try {
      const user = req.user;
      this.logger.log(`Fetching profile for user: ${JSON.stringify(user)}`);
      if (user) {
        return {
          status: 'success',
          message: 'User profile fetched successfully',
          data: {
            username: user.username,
            token: req.headers.authorization.split(' ')[1],
          },
        };
      } else {
        this.logger.error('User not found in request');
        return {
          status: 'error',
          message: 'User not found',
          data: null,
        };
      }
    } catch (error) {
      this.logger.error('Error fetching profile:', error.stack);
      return {
        status: 'error',
        message: 'Internal server error',
        data: null,
      };
    }
  }
}
