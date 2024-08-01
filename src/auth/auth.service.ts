import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        username: createUserDto.username,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        password: hashedPassword,
      },
    });
  }

  async login(loginDto: LoginDto): Promise<string> {
    this.logger.log('Attempting to login user:', loginDto.username);
    const user = await this.prisma.user.findUnique({
      where: { username: loginDto.username },
    });
    if (!user) {
      this.logger.error('User not found:', loginDto.username);
      throw new Error('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!passwordMatch) {
      this.logger.error('Password mismatch for user:', loginDto.username);
      throw new Error('Invalid credentials');
    }

    this.logger.log('User authenticated successfully:', user.username);
    try {
      const token = this.jwtService.sign({
        userId: user.id,
        username: user.username,
      });
      this.logger.log('JWT token generated successfully');
      return token;
    } catch (error) {
      this.logger.error('Error generating JWT token:', error.stack);
      throw new Error('Error generating JWT token');
    }
  }
}
