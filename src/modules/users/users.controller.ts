import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserProfileDto } from './dto/user-profile.dto';
import { CognitoAuthGuard } from '../auth/guards/cognito-auth.guard';
import { CurrentUser, CognitoUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(CognitoAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    async getProfile(@CurrentUser() user: CognitoUser): Promise<UserProfileDto> {
        return this.usersService.getProfile(user.email);
    }
} 
