import { UserProfileDto } from '../../users/dto/user-profile.dto';

export class SignInResponseDto {
    user: UserProfileDto;
    tokens: {
        accessToken: string;
        idToken: string;
        refreshToken: string;
        expiresIn: number;
    };
} 
