import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CognitoAuthGuard implements CanActivate {
    private cognitoClient: CognitoIdentityProviderClient;

    constructor(private configService: ConfigService) {
        this.cognitoClient = new CognitoIdentityProviderClient({
            region: 'us-east-1',
        });
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            const user = await this.validateToken(token);
            request.user = user;
            return true;
        } catch {
            throw new UnauthorizedException('Invalid token');
        }
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

    private async validateToken(token: string) {
        try {
            const command = new GetUserCommand({
                AccessToken: token,
            });

            const response = await this.cognitoClient.send(command);
            return {
                sub: response.Username,
                email: response.UserAttributes.find(attr => attr.Name === 'email')?.Value,
                name: response.UserAttributes.find(attr => attr.Name === 'name')?.Value,
            };
        } catch {
            throw new UnauthorizedException('Invalid token');
        }
    }
} 
