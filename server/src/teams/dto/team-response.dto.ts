import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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
}
