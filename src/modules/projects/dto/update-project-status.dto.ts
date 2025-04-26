import { IsEnum } from 'class-validator';
import { ProjectStatus } from 'src/infrastructure/entities/project.entity';

export class UpdateProjectStatusDto {
    @IsEnum(ProjectStatus)
    status: ProjectStatus;
} 
