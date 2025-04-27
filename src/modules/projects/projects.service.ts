import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { UsersService } from '../users/users.service';
import { Project } from 'src/infrastructure/entities/project.entity';
import { UserRole } from 'src/infrastructure/entities/user.entity';

@Injectable()
export class ProjectsService {
    private readonly logger = new Logger(ProjectsService.name);

    constructor(
        @InjectRepository(Project)
        private projectsRepository: Repository<Project>,
        private readonly usersService: UsersService,
    ) { }

    async create(createProjectDto: CreateProjectDto, userEmail: string): Promise<Project> {
        this.logger.log(`Creating new project for user: ${userEmail}`);

        const user = await this.usersService.findByEmail(userEmail);
        if (!user) {
            this.logger.error(`User not found: ${userEmail}`);
            throw new NotFoundException('User not found');
        }

        const project = this.projectsRepository.create({
            ...createProjectDto,
            createdById: user.id,
        });

        return this.projectsRepository.save(project);
    }

    async findAll(userEmail: string, userRole: UserRole): Promise<Project[]> {
        this.logger.log(`Finding projects for user: ${userEmail} with role: ${userRole}`);
        const user = await this.usersService.findByEmail(userEmail);
        if (!user) {
            this.logger.error(`User not found: ${userEmail}`);
            throw new NotFoundException('User not found');
        }

        if (userRole === UserRole.ADMIN) {
            return this.projectsRepository.find({
                relations: ['createdBy'],
            });
        }

        return this.projectsRepository.find({
            where: { createdById: user.id },
            relations: ['createdBy'],
        });
    }

    async findOne(id: string, userEmail: string, userRole: UserRole): Promise<Project> {
        this.logger.log(`Finding project: ${id} for user: ${userEmail}`);
        const user = await this.usersService.findByEmail(userEmail);
        if (!user) {
            this.logger.error(`User not found: ${userEmail}`);
            throw new NotFoundException('User not found');
        }

        const project = await this.projectsRepository.findOne({
            where: { id },
            relations: ['createdBy'],
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        if (userRole !== UserRole.ADMIN && project.createdById !== user.id) {
            this.logger.error(`User ${userEmail} does not have access to project: ${id}`);
            throw new ForbiddenException('You do not have access to this project');
        }

        return project;
    }

    async updateStatus(
        id: string,
        updateProjectStatusDto: UpdateProjectStatusDto,
    ): Promise<Project> {
        this.logger.log(`Updating status for project: ${id}`);

        const project = await this.projectsRepository.findOne({
            where: { id },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        project.status = updateProjectStatusDto.status;
        return this.projectsRepository.save(project);
    }
} 
