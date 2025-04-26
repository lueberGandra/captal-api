import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CognitoAuthGuard } from '../auth/guards/cognito-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CognitoUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from 'src/infrastructure/entities/user.entity';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(CognitoAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'Project successfully created',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only developers can create projects',
  })
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() user: CognitoUser,
  ) {
    return this.projectsService.create(createProjectDto, user.email);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({
    status: 200,
    description: 'Returns all projects (filtered by role)',
  })
  async findAll(@CurrentUser() user: CognitoUser) {
    return this.projectsService.findAll(user.email, UserRole.DEVELOPER);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific project' })
  @ApiResponse({
    status: 200,
    description: 'Returns the project if user has access',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have access to this project',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CognitoUser,
  ) {
    return this.projectsService.findOne(id, user.email, UserRole.DEVELOPER);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update project status' })
  @ApiResponse({
    status: 200,
    description: 'Project status successfully updated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only admins can update project status',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectStatusDto: UpdateProjectStatusDto,
  ) {
    return this.projectsService.updateStatus(
      id,
      updateProjectStatusDto,
      UserRole.DEVELOPER,
    );
  }
}
