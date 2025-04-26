import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CognitoService } from './services/cognito.service';
import { DataSource } from 'typeorm';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ConfirmSignUpDto } from './dto/confirm-signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { SignUpResponseDto } from './dto/signup-response.dto';
import { SignInResponseDto } from './dto/signin-response.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';
import { UserAlreadyExistsException, CognitoSignUpException, DatabaseTransactionException } from './exceptions/auth.exceptions';
import { CognitoSignUpDto } from './dto/cognito-signup.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly cognitoService: CognitoService,
        private readonly dataSource: DataSource,
    ) { }

    async signUp(signUpDto: SignUpDto): Promise<SignUpResponseDto> {
        const { email, password, name } = signUpDto;
        this.logger.log(`Attempting to sign up user with email: ${email}`);

        // Start a transaction
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // First check if user exists in our database
            const existingUser = await this.usersService.findByEmail(email);
            if (existingUser) {
                this.logger.warn(`User with email ${email} already exists in database`);
                throw new UserAlreadyExistsException(email);
            }

            // Create user in our database first
            this.logger.log(`Creating user in database for email: ${email}`);
            const user = await this.usersService.createUser(email, name);

            // If database creation successful, create in Cognito
            this.logger.log(`Creating user in Cognito for email: ${email}`);
            const cognitoSignUpDto: CognitoSignUpDto = {
                email,
                password,
                name,
                userId: user.id
            };
            const cognitoResponse = await this.cognitoService.signUp(cognitoSignUpDto);

            // If everything is successful, commit the transaction
            await queryRunner.commitTransaction();
            this.logger.log(`Successfully signed up user with email: ${email}`);

            return {
                user,
                cognitoResponse: {
                    userSub: cognitoResponse.UserSub,
                    userConfirmed: cognitoResponse.UserConfirmed,
                },
            };
        } catch (error) {
            // If anything fails, rollback the transaction
            await queryRunner.rollbackTransaction();

            if (error instanceof UserAlreadyExistsException) {
                throw error;
            }

            if (error.name === 'UsernameExistsException') {
                this.logger.error(`User already exists in Cognito: ${email}`);
                throw new CognitoSignUpException('User already exists in Cognito');
            }

            this.logger.error(`Error during signup for email ${email}: ${error.message}`);
            throw new DatabaseTransactionException('Failed to complete signup process');
        } finally {
            // Release the query runner
            await queryRunner.release();
        }
    }

    async signIn(signInDto: SignInDto): Promise<SignInResponseDto> {
        const { email, password } = signInDto;
        this.logger.log(`Attempting to sign in user with email: ${email}`);

        try {
            // First check if user exists in our database
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                this.logger.warn(`User with email ${email} not found in database`);
                throw new UnauthorizedException('Invalid credentials');
            }

            // Attempt to sign in with Cognito
            this.logger.log(`Authenticating user with Cognito: ${email}`);
            const cognitoResponse = await this.cognitoService.signIn(email, password);

            return {
                user,
                tokens: {
                    accessToken: cognitoResponse.AuthenticationResult.AccessToken,
                    idToken: cognitoResponse.AuthenticationResult.IdToken,
                    refreshToken: cognitoResponse.AuthenticationResult.RefreshToken,
                    expiresIn: cognitoResponse.AuthenticationResult.ExpiresIn,
                },
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            this.logger.error(`Error during sign in for email ${email}: ${error.message}`);
            throw new UnauthorizedException('Invalid credentials');
        }
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
        const { refreshToken } = refreshTokenDto;
        this.logger.log('Attempting to refresh token');

        try {
            const cognitoResponse = await this.cognitoService.refreshToken(refreshToken);

            return {
                accessToken: cognitoResponse.AuthenticationResult.AccessToken,
                idToken: cognitoResponse.AuthenticationResult.IdToken,
                refreshToken: cognitoResponse.AuthenticationResult.RefreshToken,
            };
        } catch (error) {
            this.logger.error(`Error refreshing token: ${error.message}`);
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async confirmSignUp(confirmSignUpDto: ConfirmSignUpDto): Promise<void> {
        const { email, code } = confirmSignUpDto;
        this.logger.log(`Attempting to confirm signup for email: ${email}`);

        try {
            // First check if user exists in our database
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                this.logger.warn(`User with email ${email} not found in database`);
                throw new BadRequestException('User not found');
            }

            // Confirm signup with Cognito
            this.logger.log(`Confirming signup with Cognito for email: ${email}`);
            await this.cognitoService.confirmSignUp(email, code);

            this.logger.log(`Successfully confirmed signup for email: ${email}`);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            if (error.name === 'CodeMismatchException') {
                this.logger.error(`Invalid confirmation code for email ${email}`);
                throw new BadRequestException('Invalid confirmation code');
            }

            if (error.name === 'ExpiredCodeException') {
                this.logger.error(`Expired confirmation code for email ${email}`);
                throw new BadRequestException('Confirmation code has expired');
            }

            this.logger.error(`Error confirming signup for email ${email}: ${error.message}`);
            throw new BadRequestException('Failed to confirm signup');
        }
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
        const { email } = forgotPasswordDto;
        this.logger.log(`Attempting to send password reset code to: ${email}`);

        try {
            // First check if user exists in our database
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                this.logger.warn(`User with email ${email} not found in database`);
                throw new BadRequestException('User not found');
            }

            // Request password reset code from Cognito
            this.logger.log(`Requesting password reset code from Cognito for: ${email}`);
            await this.cognitoService.forgotPassword(email);

            this.logger.log(`Successfully sent password reset code to: ${email}`);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            this.logger.error(`Error sending password reset code to ${email}: ${error.message}`);
            throw new BadRequestException('Failed to send password reset code');
        }
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
        const { email, code, newPassword } = resetPasswordDto;
        this.logger.log(`Attempting to reset password for: ${email}`);

        try {
            // First check if user exists in our database
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                this.logger.warn(`User with email ${email} not found in database`);
                throw new BadRequestException('User not found');
            }

            // Reset password with Cognito
            this.logger.log(`Resetting password with Cognito for: ${email}`);
            await this.cognitoService.resetPassword(email, code, newPassword);

            this.logger.log(`Successfully reset password for: ${email}`);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            if (error.name === 'CodeMismatchException') {
                this.logger.error(`Invalid reset code for email ${email}`);
                throw new BadRequestException('Invalid reset code');
            }

            if (error.name === 'ExpiredCodeException') {
                this.logger.error(`Expired reset code for email ${email}`);
                throw new BadRequestException('Reset code has expired');
            }

            this.logger.error(`Error resetting password for ${email}: ${error.message}`);
            throw new BadRequestException('Failed to reset password');
        }
    }

    async resendVerificationCode(resendVerificationDto: ResendVerificationDto): Promise<void> {
        const { email } = resendVerificationDto;
        this.logger.log(`Attempting to resend verification code to: ${email}`);

        try {
            // First check if user exists in our database
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                this.logger.warn(`User with email ${email} not found in database`);
                throw new BadRequestException('User not found');
            }

            // Resend verification code through Cognito
            this.logger.log(`Resending verification code through Cognito for: ${email}`);
            await this.cognitoService.resendVerificationCode(email);

            this.logger.log(`Successfully resent verification code to: ${email}`);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            if (error.name === 'UserNotFoundException') {
                this.logger.error(`User not found in Cognito: ${email}`);
                throw new BadRequestException('User not found');
            }

            if (error.name === 'InvalidParameterException') {
                this.logger.error(`User already verified in Cognito: ${email}`);
                throw new BadRequestException('User is already verified');
            }

            this.logger.error(`Error resending verification code to ${email}: ${error.message}`);
            throw new BadRequestException('Failed to resend verification code');
        }
    }
} 
