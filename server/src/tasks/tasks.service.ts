import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    createTaskDto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    // 1. Validate that the project exists
    const project = await this.prisma.project.findUnique({
      where: { id: createTaskDto.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // 2. If assignedUserId is provided, validate that the user exists
    if (createTaskDto.assignedUserId) {
      const assignee = await this.prisma.user.findUnique({
        where: { userId: createTaskDto.assignedUserId },
      });

      if (!assignee) {
        throw new BadRequestException('Assigned user not found');
      }
    }

    // 3. Create the task with authorUserId from JWT
    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        authorUserId: userId,
      },
      include: {
        author: true,
        assignee: true,
      },
    });

    return plainToInstance(TaskResponseDto, task, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    userId: number,
    projectId?: number,
  ): Promise<TaskResponseDto[]> {
    // Return tasks where user is author or assignee
    const tasks = await this.prisma.task.findMany({
      where: {
        AND: [
          projectId ? { projectId: Number(projectId) } : {},
          {
            OR: [{ authorUserId: userId }, { assignedUserId: userId }],
          },
        ],
      },
      include: {
        author: true,
        assignee: true,
      },
    });

    return tasks.map((task) =>
      plainToInstance(TaskResponseDto, task, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findOne(userId: number, taskId: number): Promise<TaskResponseDto> {
    // 1. Fetch task
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        author: true,
        assignee: true,
      },
    });

    // 2. Handle 404
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // 3. Security Check (IDOR Prevention)
    if (task.authorUserId !== userId && task.assignedUserId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to view this task',
      );
    }

    return plainToInstance(TaskResponseDto, task, {
      excludeExtraneousValues: true,
    });
  }

  async update(
    userId: number,
    taskId: number,
    updateTaskDto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    // 1. Fetch task
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    // 2. Handle 404
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // 3. Security Check: Only author or assignee can update
    if (task.authorUserId !== userId && task.assignedUserId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this task',
      );
    }

    // 4. If assignedUserId is being updated, validate the new assignee exists
    if (
      updateTaskDto.assignedUserId &&
      updateTaskDto.assignedUserId !== task.assignedUserId
    ) {
      const assignee = await this.prisma.user.findUnique({
        where: { userId: updateTaskDto.assignedUserId },
      });

      if (!assignee) {
        throw new BadRequestException('Assigned user not found');
      }
    }

    // 5. Update the task
    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: updateTaskDto,
      include: {
        author: true,
        assignee: true,
      },
    });

    return plainToInstance(TaskResponseDto, updatedTask, {
      excludeExtraneousValues: true,
    });
  }

  async remove(userId: number, taskId: number): Promise<{ message: string }> {
    // 1. Fetch task
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    // 2. Handle 404
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // 3. Security Check: Only author can delete
    if (task.authorUserId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this task. Only the author can delete.',
      );
    }

    // 4. Delete the task
    await this.prisma.task.delete({
      where: { id: taskId },
    });

    return { message: 'Task deleted successfully' };
  }
}
