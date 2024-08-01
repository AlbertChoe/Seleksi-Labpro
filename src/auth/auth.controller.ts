import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Res,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
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
      res.redirect('/auth/login');
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
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const token = await this.authService.login(loginDto);
      this.logger.log('Login successful, setting cookie and redirecting');
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/browse');
    } catch (error) {
      this.logger.error('Login failed', error.stack);
      res.status(400).send('Login failed');
    }
  }
}
