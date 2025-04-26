import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
// import { Throttle } from '@nestjs/throttler';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: SignUpDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User successfully registered',
        type: SignUpResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'User already exists',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    })
    async signUp(@Body() signUpDto: SignUpDto): Promise<SignUpResponseDto> {
        return this.authService.signUp(signUpDto);
    }

    @Post('signin')
   // @Throttle({ default: { limit: 5, ttl: 60 } }) // 5 requests per 60 seconds
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Sign in user' })
    @ApiBody({ type: SignInDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User successfully signed in',
        type: SignInResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid credentials',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    })
    @ApiResponse({
        status: HttpStatus.TOO_MANY_REQUESTS,
        description: 'Too many sign-in attempts. Please try again later.',
    })
    async signIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
        return this.authService.signIn(signInDto);
    }

    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiBody({ type: RefreshTokenDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Token successfully refreshed',
        type: RefreshTokenResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid refresh token',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    })
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
        return this.authService.refreshToken(refreshTokenDto);
    }

    @Post('confirm-signup')
   // @Throttle({ default: { limit: 3, ttl: 60 } }) // 3 attempts per 60 seconds
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Confirm user registration with verification code' })
    @ApiBody({ type: ConfirmSignUpDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User successfully confirmed',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid confirmation code or user not found',
    })
    @ApiResponse({
        status: HttpStatus.TOO_MANY_REQUESTS,
        description: 'Too many confirmation attempts. Please try again later.',
    })
    async confirmSignUp(@Body() confirmSignUpDto: ConfirmSignUpDto): Promise<void> {
        return this.authService.confirmSignUp(confirmSignUpDto);
    }

    @Post('forgot-password')
 //   @Throttle({ default: { limit: 3, ttl: 60 } }) // 3 attempts per 60 seconds
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Request password reset code' })
    @ApiBody({ type: ForgotPasswordDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Password reset code sent successfully',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'User not found',
    })
    @ApiResponse({
        status: HttpStatus.TOO_MANY_REQUESTS,
        description: 'Too many reset attempts. Please try again later.',
    })
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<void> {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @Post('reset-password')
 //   @Throttle({ default: { limit: 3, ttl: 60 } }) // 3 attempts per 60 seconds
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reset password with verification code' })
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Password successfully reset',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid reset code or user not found',
    })
    @ApiResponse({
        status: HttpStatus.TOO_MANY_REQUESTS,
        description: 'Too many reset attempts. Please try again later.',
    })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
        return this.authService.resetPassword(resetPasswordDto);
    }

    @Post('resend-verification')
  //  @Throttle({ default: { limit: 3, ttl: 60 } }) // 3 attempts per 60 seconds
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Resend verification code' })
    @ApiBody({ type: ResendVerificationDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Verification code sent successfully',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'User not found or already verified',
    })
    @ApiResponse({
        status: HttpStatus.TOO_MANY_REQUESTS,
        description: 'Too many resend attempts. Please try again later.',
    })
    async resendVerification(@Body() resendVerificationDto: ResendVerificationDto): Promise<void> {
        return this.authService.resendVerificationCode(resendVerificationDto);
    }
} 
