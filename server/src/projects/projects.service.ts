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
    try {
      // Get user's current team
      const user = await this.prisma.user.findUnique({
        where: { userId },
        select: { teamId: true },
      });

      const teamIdToUse = createProjectDto.teamId || user?.teamId;

      if (!teamIdToUse) {
        throw new BadRequestException(
          'You must belong to a team to create a project. Please join or create a team first.',
        );
      }

      // Verify team exists
      const team = await this.prisma.team.findUnique({
        where: { id: teamIdToUse },
      });

      if (!team) {
        throw new BadRequestException(
          `Team with ID ${teamIdToUse} not found`,
        );
      }

      // Create project and link to team
      const project = await this.prisma.$transaction(async (tx) => {
        const newProject = await tx.project.create({
          data: {
            name: createProjectDto.name,
            description: createProjectDto.description,
            startDate: createProjectDto.startDate
              ? new Date(createProjectDto.startDate)
              : undefined,
            endDate: createProjectDto.endDate
              ? new Date(createProjectDto.endDate)
              : undefined,
          },
        });

        // Link team to project
        await tx.projectTeam.create({
          data: {
            teamId: teamIdToUse,
            projectId: newProject.id,
          },
        });

        return newProject;
      });

      return plainToInstance(ProjectResponseDto, project, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
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
        startDate: updateProjectDto.startDate
          ? new Date(updateProjectDto.startDate)
          : undefined,
        endDate: updateProjectDto.endDate
          ? new Date(updateProjectDto.endDate)
          : undefined,
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
