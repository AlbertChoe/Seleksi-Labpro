import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Res,
  Logger,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Get('register')
  @Render('register')
  showRegistrationForm() {
    this.logger.log('Rendering registration form');
    return {};
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      this.logger.log('Registering new user');
      await this.authService.register(createUserDto);
      res.redirect('/login');
    } catch (error) {
      this.logger.error('Registration failed', error.stack);
      res.status(400).send('Registration failed');
    }
  }

  @Get('login')
  @Render('login')
  showLoginForm() {
    this.logger.log('Rendering login form');
    return {};
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const token = await this.authService.login(loginDto);
      this.logger.log('Login successful, setting cookie and redirecting');
      res.cookie('token', token, { httpOnly: true });

      const acceptHeader = req.headers['accept'];

      // Check if the request accepts HTML or JSON
      if (acceptHeader && acceptHeader.includes('application/json')) {
        // Respond with JSON for frontend admin
        res.status(200).json({
          status: 'success',
          message: 'Login successful',
          data: {
            username: loginDto.username,
            token: token,
          },
        });
      } else {
        // Redirect for your own frontend
        res.redirect('/');
      }
    } catch (error) {
      this.logger.error('Login failed', error.stack);

      const acceptHeader = req.headers['accept'];

      if (acceptHeader && acceptHeader.includes('application/json')) {
        // Respond with JSON for frontend admin
        res.status(400).json({
          status: 'error',
          message: 'Login failed',
          data: null,
        });
      } else {
        // Handle the error for your own frontend
        res.status(400).send('Login failed');
      }
    }
  }

  @Get('self')
  @UseGuards(JwtAuthGuard)
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
            token: req.headers.authorization.split(' ')[1], // Extract token from header
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
