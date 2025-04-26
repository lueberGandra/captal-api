import { IsEmail, IsString, MinLength, IsNotEmpty, Matches } from 'class-validator';

export class SignUpDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8)
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d\W]{8,}$/,
        {
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        },
    )
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    name: string;
} 
