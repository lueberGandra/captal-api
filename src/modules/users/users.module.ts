import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from 'src/infrastructure/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        ConfigModule
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { } 
