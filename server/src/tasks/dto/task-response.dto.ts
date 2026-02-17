import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import { UserResponseDto } from '../../auth/dto/user-response.dto';

export class TaskResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty({ required: false })
  @Expose()
  description?: string;

  @ApiProperty({ enum: TaskStatus })
  @Expose()
  status?: TaskStatus;

  @ApiProperty({ required: false })
  @Expose()
  priority?: string;

  @ApiProperty({ required: false })
  @Expose()
  tags?: string;

  @ApiProperty({ required: false })
  @Expose()
  startDate?: Date;

  @ApiProperty({ required: false })
  @Expose()
  dueDate?: Date;

  @ApiProperty({ required: false })
  @Expose()
  points?: number;

  @ApiProperty()
  @Expose()
  position: number;

  @ApiProperty()
  @Expose()
  projectId: number;

  @ApiProperty()
  @Expose()
  authorUserId: number;

  @ApiProperty({ required: false })
  @Expose()
  assignedUserId?: number;

  @ApiProperty({ type: () => UserResponseDto, required: false })
  @Expose()
  @Type(() => UserResponseDto)
  author?: UserResponseDto;

  @ApiProperty({ type: () => UserResponseDto, required: false })
  @Expose()
  @Type(() => UserResponseDto)
  assignee?: UserResponseDto;
}
