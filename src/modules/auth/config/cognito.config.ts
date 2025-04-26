import { registerAs } from '@nestjs/config';

export interface CognitoConfig {
    region: string;
    clientId: string;
    userPoolId: string;
}

export const cognitoConfig = registerAs('cognito', (): CognitoConfig => ({
    region: 'us-east-1',
    clientId: process.env.COGNITO_CLIENT_ID,
    userPoolId: process.env.COGNITO_USER_POOL_ID,
})); 
