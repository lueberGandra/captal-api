import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import DecodeToken from 'src/common/strategies/decode-token';

export interface CognitoUser {
    sub: string;
    email: string;
}

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): CognitoUser => {
        const request = ctx.switchToHttp().getRequest();
        const token = request.headers.authorization;
        let user: any = {};
        if (token) {
            const decodedToken = DecodeToken.decodeToken(token);
            user = {
                sub: decodedToken.sub,
                email: decodedToken.username,
            };
        }

        return user;
    },
);
