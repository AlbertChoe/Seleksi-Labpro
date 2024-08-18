import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Res,
  Logger,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller()
export class WebAuthController {
  private readonly logger = new Logger(WebAuthController.name);

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
      res.status(400).render('register', {
        errorMessage: 'Registration failed. Please try again.',
      });
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

      const user = await this.authService.validateUser(
        loginDto.username,
        loginDto.password,
      );

      req.user = {
        username: user.username,
        id: user.id,
        balance: user.balance,
        role: user.role,
      };
      res.redirect('/');
    } catch (error) {
      this.logger.error('Login failed', error.stack);
      res
        .status(400)
        .render('login', { errorMessage: 'Invalid username or password' });
    }
  }

  @Post('logout')
  async logout(@Res() res: Response, @Req() req: Request) {
    try {
      this.logger.log('Logging out user');
      res.clearCookie('token');
      req.user = null;
      res.redirect('/login'); // Redirect to login page or another route
    } catch (error) {
      this.logger.error('Logout failed', error.stack);
      res.status(400).send('Logout failed');
    }
  }
}
