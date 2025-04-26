import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAlreadyExistsException extends HttpException {
    constructor(email: string) {
        super(`User with email ${email} already exists`, HttpStatus.CONFLICT);
    }
}

export class CognitoSignUpException extends HttpException {
    constructor(message: string) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}

export class DatabaseTransactionException extends HttpException {
    constructor(message: string) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
} 
