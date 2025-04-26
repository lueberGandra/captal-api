import { UserRole } from 'src/infrastructure/entities/user.entity';

export class UserProfileDto {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
} 
