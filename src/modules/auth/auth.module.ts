import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CognitoAuthGuard } from './guards/cognito-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { CognitoService } from './services/cognito.service';
import { cognitoConfig } from './config/cognito.config';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/infrastructure/entities/user.entity';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        TypeOrmModule.forFeature([User]),
        ConfigModule.forFeature(cognitoConfig),
        UsersModule,
    ],
    controllers: [AuthController],
    providers: [CognitoAuthGuard, RolesGuard, AuthService, CognitoService, JwtStrategy],
    exports: [CognitoAuthGuard, RolesGuard, AuthService, CognitoService],
})
export class AuthModule { } 
