import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    InitiateAuthCommand,
    ConfirmSignUpCommand,
    ForgotPasswordCommand,
    ConfirmForgotPasswordCommand,
    ResendConfirmationCodeCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoConfig } from '../config/cognito.config';
import { CognitoSignUpDto } from '../dto/cognito-signup.dto';
import { UserRole } from 'src/infrastructure/entities/user.entity';

@Injectable()
export class CognitoService {
    private cognitoClient: CognitoIdentityProviderClient;
    private config: CognitoConfig;
    private readonly logger = new Logger(CognitoService.name);

    constructor(private readonly configService: ConfigService) {
        this.config = this.configService.get<CognitoConfig>('cognito');

        if (!this.config) {
            this.logger.error('Cognito configuration is missing');
            throw new Error('Cognito configuration is missing');
        }

        if (!this.config.clientId || !this.config.userPoolId) {
            this.logger.error('Cognito clientId or userPoolId is missing');
            throw new Error('Cognito clientId or userPoolId is missing');
        }

        this.cognitoClient = new CognitoIdentityProviderClient({
            region: this.config.region,
        });
    }

    async signUp(signUpDto: CognitoSignUpDto) {
        const signUpCommand = new SignUpCommand({
            ClientId: this.config.clientId,
            Username: signUpDto.email,
            Password: signUpDto.password,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: signUpDto.email,
                },
                {
                    Name: 'name',
                    Value: signUpDto.name,
                },
                {
                    Name: 'custom:userId',
                    Value: signUpDto.userId,
                },
                {
                    Name: 'custom:role',
                    Value: UserRole.DEVELOPER,
                }
            ],
        });

        return this.cognitoClient.send(signUpCommand);
    }

    async signIn(email: string, password: string) {
        const initiateAuthCommand = new InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: this.config.clientId,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
            },
        });

        return this.cognitoClient.send(initiateAuthCommand);
    }

    async refreshToken(refreshToken: string) {
        const initiateAuthCommand = new InitiateAuthCommand({
            AuthFlow: 'REFRESH_TOKEN_AUTH',
            ClientId: this.config.clientId,
            AuthParameters: {
                REFRESH_TOKEN: refreshToken,
            },
        });

        return this.cognitoClient.send(initiateAuthCommand);
    }

    async confirmSignUp(email: string, code: string) {
        const confirmSignUpCommand = new ConfirmSignUpCommand({
            ClientId: this.config.clientId,
            Username: email,
            ConfirmationCode: code,
        });

        return this.cognitoClient.send(confirmSignUpCommand);
    }

    async forgotPassword(email: string) {
        const forgotPasswordCommand = new ForgotPasswordCommand({
            ClientId: this.config.clientId,
            Username: email,
        });

        return this.cognitoClient.send(forgotPasswordCommand);
    }

    async resetPassword(email: string, code: string, newPassword: string) {
        const confirmForgotPasswordCommand = new ConfirmForgotPasswordCommand({
            ClientId: this.config.clientId,
            Username: email,
            ConfirmationCode: code,
            Password: newPassword,
        });

        return this.cognitoClient.send(confirmForgotPasswordCommand);
    }

    async resendVerificationCode(email: string) {
        const resendConfirmationCodeCommand = new ResendConfirmationCodeCommand({
            ClientId: this.config.clientId,
            Username: email,
        });

        return this.cognitoClient.send(resendConfirmationCodeCommand);
    }
} 
