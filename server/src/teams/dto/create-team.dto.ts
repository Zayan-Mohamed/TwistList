import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ example: 'Engineering Team' })
  @IsString()
  @IsNotEmpty()
  teamName: string;

  @ApiProperty({ required: false, description: 'Product Owner User ID' })
  @IsInt()
  @IsOptional()
  productOwnerUserId?: number;

  @ApiProperty({ required: false, description: 'Project Manager User ID' })
  @IsInt()
  @IsOptional()
  projectManagerUserId?: number;
}
