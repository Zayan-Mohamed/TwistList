import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamResponseDto } from './dto/team-response.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../auth/decorator/get-user.decorator';

@ApiTags('Teams')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({
    status: 201,
    description: 'Team successfully created',
    type: TeamResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @GetUser('userId') userId: number,
    @Body() createTeamDto: CreateTeamDto,
  ): Promise<TeamResponseDto> {
    return this.teamsService.create(userId, createTeamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all teams for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of teams',
    type: [TeamResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@GetUser('userId') userId: number): Promise<TeamResponseDto[]> {
    return this.teamsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific team by ID' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({
    status: 200,
    description: 'Team details',
    type: TeamResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your team' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  findOne(
    @GetUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TeamResponseDto> {
    return this.teamsService.findOne(userId, id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a user to the team by username or email' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({
    status: 201,
    description: 'Member added successfully',
    schema: { example: { message: 'Member added successfully' } },
  })
  @ApiResponse({ status: 404, description: 'User or Team not found' })
  @ApiResponse({ status: 400, description: 'User already in a team' })
  addMember(
    @GetUser('userId') userId: number,
    @Param('id', ParseIntPipe) teamId: number,
    @Body() body: { usernameOrEmail: string },
  ): Promise<{ message: string }> {
    return this.teamsService.addMember(userId, teamId, body.usernameOrEmail);
  }

  @Post('leave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Leave the current team' })
  @ApiResponse({
    status: 200,
    description: 'Left team successfully',
    schema: { example: { message: 'Left team successfully' } },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  leaveTeam(@GetUser('userId') userId: number): Promise<{ message: string }> {
    return this.teamsService.leaveTeam(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a team' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({
    status: 200,
    description: 'Team successfully updated',
    type: TeamResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your team' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  update(
    @GetUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeamDto: UpdateTeamDto,
  ): Promise<TeamResponseDto> {
    return this.teamsService.update(userId, id, updateTeamDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a team' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({
    status: 200,
    description: 'Team successfully deleted',
    schema: { example: { message: 'Team deleted successfully' } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your team' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  remove(
    @GetUser('userId') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.teamsService.remove(userId, id);
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request to join a team' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({
    status: 200,
    description: 'Join request sent successfully',
    schema: { example: { message: 'Join request sent successfully' } },
  })
  requestJoin(
    @GetUser('userId') userId: number,
    @Param('id', ParseIntPipe) teamId: number,
  ): Promise<{ message: string }> {
    return this.teamsService.requestJoin(userId, teamId);
  }

  @Post(':id/requests/:requestId/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept a join request' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiParam({ name: 'requestId', description: 'Request ID' })
  acceptRequest(
    @GetUser('userId') userId: number,
    @Param('id', ParseIntPipe) teamId: number,
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<{ message: string }> {
    return this.teamsService.acceptRequest(userId, teamId, requestId);
  }

  @Post(':id/requests/:requestId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a join request' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiParam({ name: 'requestId', description: 'Request ID' })
  rejectRequest(
    @GetUser('userId') userId: number,
    @Param('id', ParseIntPipe) teamId: number,
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<{ message: string }> {
    return this.teamsService.rejectRequest(userId, teamId, requestId);
  }
}
