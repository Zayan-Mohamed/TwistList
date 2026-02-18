import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from '../auth/dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async updateProfile(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // If password is being updated, hash it
    const dataToUpdate: any = { ...updateUserDto };

    if (updateUserDto.password) {
      dataToUpdate.password = await argon.hash(updateUserDto.password);
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { userId },
        data: dataToUpdate,
      });

      return plainToInstance(UserResponseDto, updatedUser, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email or username already taken');
        }
      }
      throw error;
    }
  }

  async deleteAccount(userId: number): Promise<{ message: string }> {
    await this.prisma.user.delete({
      where: { userId },
    });

    return { message: 'Account deleted successfully' };
  }

  async searchUsers(query: string): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10, // Limit to 10 results for autocomplete
    });

    return users.map((user) =>
      plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
