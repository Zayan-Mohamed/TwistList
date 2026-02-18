import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamResponseDto, RequestStatus } from './dto/team-response.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    createTeamDto: CreateTeamDto,
  ): Promise<TeamResponseDto> {
    try {
      // Create team and assign creator to it
      // Using transaction to ensure atomicity
      const team = await this.prisma.$transaction(async (tx) => {
        const newTeam = await tx.team.create({
          data: {
            teamName: createTeamDto.teamName,
            productOwnerUserId: createTeamDto.productOwnerUserId,
            projectManagerUserId: createTeamDto.projectManagerUserId,
          },
        });

        // Assign creator to the team
        await tx.user.update({
          where: { userId },
          data: { teamId: newTeam.id },
        });

        return newTeam;
      });

      return {
        id: team.id,
        teamName: team.teamName,
        productOwnerUserId: team.productOwnerUserId ?? undefined,
        projectManagerUserId: team.projectManagerUserId ?? undefined,
      };
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  async findAll(_userId: number): Promise<TeamResponseDto[]> {
    try {
      // Fetch all teams with users and requests to allow join functionality
      const teams = await this.prisma.team.findMany({
        select: {
          id: true,
          teamName: true,
          productOwnerUserId: true,
          projectManagerUserId: true,
          user: {
            select: {
              userId: true,
              username: true,
              email: true,
              profilePictureUrl: true,
              teamId: true,
            },
          },
        },
      });

      // Return teams with membership info (requests will be added once migration runs)
      return teams.map((team) => ({
        id: team.id,
        teamName: team.teamName,
        productOwnerUserId: team.productOwnerUserId ?? undefined,
        projectManagerUserId: team.projectManagerUserId ?? undefined,
        users: team.user.map((u) => ({
          userId: u.userId,
          username: u.username,
          email: u.email,
          profilePictureUrl: u.profilePictureUrl ?? undefined,
          teamId: u.teamId ?? undefined,
        })),
        requests: [], // Temporarily empty until TeamRequest table is created
      }));
    } catch (error) {
      console.error('Error in findAll teams:', error);
      // Log the full error for debugging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }

  async findOne(userId: number, teamId: number): Promise<TeamResponseDto> {
    try {
      const team = await this.prisma.team.findUnique({
        where: { id: teamId },
        select: {
          id: true,
          teamName: true,
          productOwnerUserId: true,
          projectManagerUserId: true,
          user: {
            select: {
              userId: true,
              username: true,
              email: true,
              profilePictureUrl: true,
              teamId: true,
            },
          },
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

      return {
        id: team.id,
        teamName: team.teamName,
        productOwnerUserId: team.productOwnerUserId ?? undefined,
        projectManagerUserId: team.projectManagerUserId ?? undefined,
        users: team.user.map((u) => ({
          userId: u.userId,
          username: u.username,
          email: u.email,
          profilePictureUrl: u.profilePictureUrl ?? undefined,
          teamId: u.teamId ?? undefined,
        })),
      };
    } catch (error) {
      console.error('Error in findOne team:', error);
      throw error;
    }
  }

  async addMember(
    currentUserId: number,
    teamId: number,
    usernameToAdd: string,
  ): Promise<{ message: string }> {
    // 1. Check if the current user has access to modify this team (e.g., is a member)
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { user: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const isMember = team.user.some((u) => u.userId === currentUserId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // 2. Find the user to add
    const userToAdd = await this.prisma.user.findUnique({
      where: { username: usernameToAdd },
    });

    if (!userToAdd) {
      throw new NotFoundException(`User '${usernameToAdd}' not found`);
    }

    // 3. Check if user is already in a team (assuming 1 team per user for now based on schema)
    if (userToAdd.teamId) {
      if (userToAdd.teamId === teamId) {
        return { message: 'User is already in this team' };
      }
      throw new BadRequestException('User is already in another team');
    }

    // 4. Add user to team
    await this.prisma.user.update({
      where: { userId: userToAdd.userId },
      data: { teamId: teamId },
    });

    return { message: 'Member added successfully' };
  }

  async leaveTeam(userId: number): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.teamId) {
      return { message: 'User is not in any team' };
    }

    await this.prisma.user.update({
      where: { userId },
      data: { teamId: null },
    });

    return { message: 'Left team successfully' };
  }

  async update(
    userId: number,
    teamId: number,
    updateTeamDto: UpdateTeamDto,
  ): Promise<TeamResponseDto> {
    try {
      const team = await this.prisma.team.findUnique({
        where: { id: teamId },
        select: {
          id: true,
          teamName: true,
          productOwnerUserId: true,
          projectManagerUserId: true,
          user: {
            select: {
              userId: true,
            },
          },
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

      return {
        id: updatedTeam.id,
        teamName: updatedTeam.teamName,
        productOwnerUserId: updatedTeam.productOwnerUserId ?? undefined,
        projectManagerUserId: updatedTeam.projectManagerUserId ?? undefined,
      };
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
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

  async requestJoin(
    userId: number,
    teamId: number,
  ): Promise<{ message: string }> {
    try {
      const team = await this.prisma.team.findUnique({
        where: { id: teamId },
        include: { user: true },
      });

      if (!team) {
        throw new NotFoundException('Team not found');
      }

      const userInTeam = team.user.some((u) => u.userId === userId);
      if (userInTeam) {
        throw new BadRequestException('You are already in this team');
      }

      // Check for existing request using the unique constraint
      const existingRequest = await this.prisma.teamRequest.findUnique({
        where: {
          teamId_userId: {
            teamId: teamId,
            userId: userId,
          },
        },
      });

      if (existingRequest) {
        if (existingRequest.status === 'PENDING') {
          throw new BadRequestException(
            'You already have a pending request for this team',
          );
        } else if (existingRequest.status === 'REJECTED') {
          // Re-open request
          await this.prisma.teamRequest.update({
            where: { id: existingRequest.id },
            data: { status: 'PENDING' },
          });
          return { message: 'Join request sent successfully' };
        } else if (existingRequest.status === 'APPROVED') {
          throw new BadRequestException(
            'You have already been approved for this team',
          );
        }
      }

      // Create new request if none exists
      await this.prisma.teamRequest.create({
        data: {
          teamId,
          userId,
          status: 'PENDING',
        },
      });

      return { message: 'Join request sent successfully' };
    } catch (error) {
      console.error('Error in requestJoin:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }

  async acceptRequest(
    userId: number,
    teamId: number,
    requestId: number,
  ): Promise<{ message: string }> {
    // 1. Verify requester has permission (must be team member)
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { user: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const isMember = team.user.some((u) => u.userId === userId);
    if (!isMember) {
      throw new ForbiddenException(
        'You do not have permission to accept requests for this team',
      );
    }

    // 2. Find request
    const request = await this.prisma.teamRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }
    if (request.teamId !== teamId) {
      throw new BadRequestException('Request does not belong to this team');
    }
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request is not pending');
    }

    // 3. Add user to team and update request status
    await this.prisma.$transaction(async (tx) => {
      // Add user to team
      await tx.user.update({
        where: { userId: request.userId },
        data: { teamId: teamId },
      });

      // Update request status
      await tx.teamRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' },
      });
    });

    return { message: 'Request accepted successfully' };
  }

  async rejectRequest(
    userId: number,
    teamId: number,
    requestId: number,
  ): Promise<{ message: string }> {
    // 1. Verify requester has permission
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { user: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const isMember = team.user.some((u) => u.userId === userId);
    if (!isMember) {
      throw new ForbiddenException(
        'You do not have permission to reject requests for this team',
      );
    }

    // 2. Find request
    const request = await this.prisma.teamRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }
    if (request.teamId !== teamId) {
      throw new BadRequestException('Request does not belong to this team');
    }
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request is not pending');
    }

    // 3. Update request status
    await this.prisma.teamRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });

    return { message: 'Request rejected successfully' };
  }
}
