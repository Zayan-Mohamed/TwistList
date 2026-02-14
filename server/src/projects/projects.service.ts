import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    createProjectDto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    // Create project and optionally link to a team
    const project = await this.prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          name: createProjectDto.name,
          description: createProjectDto.description,
          startDate: createProjectDto.startDate,
          endDate: createProjectDto.endDate,
        },
      });

      // If teamId is provided, link the team to the project
      if (createProjectDto.teamId) {
        // Verify the team exists
        const team = await tx.team.findUnique({
          where: { id: createProjectDto.teamId },
          include: { user: true },
        });

        if (!team) {
          throw new BadRequestException('Team not found');
        }

        // Verify user is in the team
        const userInTeam = team.user.some((u) => u.userId === userId);
        if (!userInTeam) {
          throw new ForbiddenException('You are not a member of this team');
        }

        // Link team to project
        await tx.projectTeam.create({
          data: {
            teamId: createProjectDto.teamId,
            projectId: newProject.id,
          },
        });
      }

      return newProject;
    });

    return plainToInstance(ProjectResponseDto, project, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(userId: number): Promise<ProjectResponseDto[]> {
    // Get user's team
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: { teamId: true },
    });

    if (!user?.teamId) {
      return [];
    }

    // Get projects linked to user's team
    const projectTeams = await this.prisma.projectTeam.findMany({
      where: { teamId: user.teamId },
      include: { project: true },
    });

    const projects = projectTeams.map((pt) => pt.project);

    return projects.map((project) =>
      plainToInstance(ProjectResponseDto, project, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findOne(
    userId: number,
    projectId: number,
  ): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        projectTeams: {
          include: {
            team: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user has access to this project via team membership
    const hasAccess = project.projectTeams.some((pt) =>
      pt.team.user.some((u) => u.userId === userId),
    );

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return plainToInstance(ProjectResponseDto, project, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    userId: number,
    projectId: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    // Verify access
    await this.findOne(userId, projectId);

    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        name: updateProjectDto.name,
        description: updateProjectDto.description,
        startDate: updateProjectDto.startDate,
        endDate: updateProjectDto.endDate,
      },
    });

    return plainToInstance(ProjectResponseDto, updatedProject, {
      excludeExtraneousValues: true,
    });
  }

  async remove(
    userId: number,
    projectId: number,
  ): Promise<{ message: string }> {
    // Verify access
    await this.findOne(userId, projectId);

    await this.prisma.project.delete({
      where: { id: projectId },
    });

    return { message: 'Project deleted successfully' };
  }
}
