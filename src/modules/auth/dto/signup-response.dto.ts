import { UserProfileDto } from '../../users/dto/user-profile.dto';

export class SignUpResponseDto {
    user: UserProfileDto;
    cognitoResponse: {
        userSub: string;
        userConfirmed: boolean;
    };
} 
