import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamResponseDto } from './dto/team-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    createTeamDto: CreateTeamDto,
  ): Promise<TeamResponseDto> {
    // Create team (user becomes implicit owner)
    const team = await this.prisma.team.create({
      data: {
        teamName: createTeamDto.teamName,
        productOwnerUserId: createTeamDto.productOwnerUserId,
        projectManagerUserId: createTeamDto.projectManagerUserId,
      },
    });

    // Assign creator to the team
    await this.prisma.user.update({
      where: { userId },
      data: { teamId: team.id },
    });

    return plainToInstance(TeamResponseDto, team, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(userId: number): Promise<TeamResponseDto[]> {
    // Get user to find their teamId
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: { teamId: true },
    });

    if (!user?.teamId) {
      return [];
    }

    // Return user's team
    const team = await this.prisma.team.findUnique({
      where: { id: user.teamId },
    });

    if (!team) {
      return [];
    }

    return [
      plainToInstance(TeamResponseDto, team, {
        excludeExtraneousValues: true,
      }),
    ];
  }

  async findOne(userId: number, teamId: number): Promise<TeamResponseDto> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        user: true,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if user belongs to this team
    const userInTeam = team.user.some((u) => u.userId === userId);

    if (!userInTeam) {
      throw new ForbiddenException('You do not have access to this team');
    }

    return plainToInstance(TeamResponseDto, team, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    userId: number,
    teamId: number,
    updateTeamDto: UpdateTeamDto,
  ): Promise<TeamResponseDto> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        user: true,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if user belongs to this team
    const userInTeam = team.user.some((u) => u.userId === userId);

    if (!userInTeam) {
      throw new ForbiddenException('You do not have access to this team');
    }

    const updatedTeam = await this.prisma.team.update({
      where: { id: teamId },
      data: updateTeamDto,
    });

    return plainToInstance(TeamResponseDto, updatedTeam, {
      excludeExtraneousValues: true,
    });
  }

  async remove(userId: number, teamId: number): Promise<{ message: string }> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        user: true,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if user belongs to this team
    const userInTeam = team.user.some((u) => u.userId === userId);

    if (!userInTeam) {
      throw new ForbiddenException('You do not have access to this team');
    }

    await this.prisma.team.delete({
      where: { id: teamId },
    });

    return { message: 'Team deleted successfully' };
  }
}
