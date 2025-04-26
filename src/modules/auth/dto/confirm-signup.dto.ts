import { IsEmail, IsString, IsNotEmpty, Length } from 'class-validator';

export class ConfirmSignUpDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Length(6, 6, { message: 'Confirmation code must be exactly 6 characters' })
    code: string;
} 
