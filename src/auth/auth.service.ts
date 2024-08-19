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
    const emailLowercased = createUserDto.email.toLowerCase();

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: emailLowercased }, { username: createUserDto.username }],
      },
    });

    if (existingUser) {
      throw new Error('Email or username already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
      data: {
        email: emailLowercased,
        username: createUserDto.username,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        password: hashedPassword,
      },
    });
  }

  async login(loginDto: LoginDto): Promise<string> {
    this.logger.log(`Attempting to login user: ${loginDto.username}`);

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: loginDto.username.toLowerCase() },
          { username: loginDto.username },
        ],
      },
    });

    if (!user) {
      this.logger.error(`User not found: ${loginDto.username}`);
      throw new Error('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!passwordMatch) {
      this.logger.error(`Password mismatch for user: ${loginDto.username}`);
      throw new Error('Invalid credentials');
    }

    this.logger.log(`User authenticated successfully: ${user.username}`);
    try {
      const token = this.jwtService.sign({
        userId: user.id,
        username: user.username,
        role: user.role,
      });
      this.logger.log('JWT token generated successfully');
      return token;
    } catch (error) {
      this.logger.error('Error generating JWT token:', error.stack);
      throw new Error('Error generating JWT token');
    }
  }

  async validateUser(usernameOrEmail: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail.toLowerCase() },
        ],
      },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
