import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../auth/dto/user-response.dto';

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class TeamRequestDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  teamId: number;

  @ApiProperty()
  @Expose()
  userId: number;

  @ApiProperty({ enum: RequestStatus })
  @Expose()
  status: RequestStatus;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: UserResponseDto })
  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;
}

export class TeamResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  teamName: string;

  @ApiProperty({ required: false })
  @Expose()
  productOwnerUserId?: number;

  @ApiProperty({ required: false })
  @Expose()
  projectManagerUserId?: number;

  @ApiProperty({ type: [UserResponseDto], required: false })
  @Expose({ name: 'user' })
  @Type(() => UserResponseDto)
  users?: UserResponseDto[];

  @ApiProperty({ type: [TeamRequestDto], required: false })
  @Expose({ name: 'teamRequests' })
  @Type(() => TeamRequestDto)
  requests?: TeamRequestDto[];
}
