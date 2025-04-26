import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfileDto } from './dto/user-profile.dto';
import { User } from 'src/infrastructure/entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findById(id: string): Promise<User> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async findByEmail(email: string): Promise<User> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async getProfile(id: string): Promise<UserProfileDto> {
        const user = await this.findByEmail(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async createUser(email: string, name: string): Promise<User> {
        // Check if user already exists
        const existingUser = await this.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const user = this.usersRepository.create({
            email,
            name,
        });
        return this.usersRepository.save(user);
    }
} 
