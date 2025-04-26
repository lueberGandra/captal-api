import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class CognitoSignUpDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    userId: string;
} 
