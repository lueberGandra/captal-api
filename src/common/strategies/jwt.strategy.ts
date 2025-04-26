import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { passportJwtSecret } from 'jwks-rsa';
import { getSegment, Segment } from 'aws-xray-sdk-core';
import { isServerlessOffline } from 'src/environment';
import { ConfigService } from '@nestjs/config';
import { CognitoConfig } from 'src/modules/auth/config/cognito.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        const cognitoConfig = configService.get<CognitoConfig>('cognito');
        super({
            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `https://cognito-idp.${cognitoConfig.region}.amazonaws.com/${cognitoConfig.userPoolId}/.well-known/jwks.json`,
            }),

            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            audience: cognitoConfig.clientId,
            issuer: `https://cognito-idp.${cognitoConfig.region}.amazonaws.com/${cognitoConfig.userPoolId}`,
            algorithms: ['RS256'],
        });

    }

    public async validate(payload: any) {
        const isValid = !!payload.sub;

        if (isValid && !isServerlessOffline()) {
            const segment = getSegment() as Segment;
            const newSubseg = segment.addNewSubsegment('Authentication');
            newSubseg.addMetadata('userId', payload['custom:user_id']);
            newSubseg.close();
        }
        return isValid;
    }
}
