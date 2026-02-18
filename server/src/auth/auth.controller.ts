import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from './dto/auth.dto';
import type { FastifyReply } from 'fastify';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        message: 'User successfully registered',
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Credentials already taken' })
  async signup(@Body() dto: SignUpDto, @Res() reply: FastifyReply) {
    const result = await this.authService.signup(dto);

    // Set httpOnly cookie for cross-domain authentication
    reply.setCookie('auth_token', result.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 86400000, // 24 hours
      path: '/',
    });

    return reply.send({ message: 'User successfully registered' });
  }

  @Post('signin')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in an existing user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully signed in',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Credentials incorrect' })
  async signin(@Body() dto: SignInDto, @Res() reply: FastifyReply) {
    const result = await this.authService.signin(dto);

    // Set httpOnly cookie for cross-domain authentication
    reply.setCookie('auth_token', result.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 86400000, // 24 hours
      path: '/',
    });

    // Still return access_token in response for compatibility
    return reply.send({ access_token: result.access_token });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
  })
  async logout(@Res() reply: FastifyReply) {
    // Clear the httpOnly cookie
    reply.setCookie('auth_token', '', {
      httpOnly: true,
      secure: true, // Must match the original cookie settings
      sameSite: 'none', // Must match the original cookie settings
      maxAge: 0,
      path: '/',
    });

    return reply.send({ message: 'Logged out successfully' });
  }
}
