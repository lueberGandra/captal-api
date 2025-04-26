import { IsEmail, IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class ResetPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Length(6, 6, { message: 'Confirmation code must be exactly 6 characters' })
    code: string;

    @IsString()
    @IsNotEmpty()
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        },
    )
    newPassword: string;
} 
