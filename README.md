# Backend Architecture - Real Estate Project Platform (Captal)

## 📝 Introduction
Captal is a comprehensive real estate project management platform designed to streamline the process of real estate development from proposal to execution. The platform connects real estate developers with project administrators, enabling efficient project submission, review, and approval workflows. Developers can submit detailed project proposals including location, land area, cost estimates, and expected revenue, while administrators can review, approve, or reject these proposals based on predefined criteria. The system implements a robust authentication system using AWS Cognito to ensure secure access and role-based permissions, allowing developers to manage their own projects while administrators have oversight of all submissions. This architecture document outlines the backend implementation, which serves as the foundation for the platform's API-driven frontend application.

## 🧱 Overview
A backend API developed with **NestJS**, deployed via **AWS Lambda** using the **Serverless Framework**. User authentication is managed through **AWS Cognito**, and data is persisted using **Amazon RDS (PostgreSQL)** via **TypeORM**.

The system supports two roles:
- **Developer**: submits and tracks real estate project proposals.
- **Admin**: reviews, approves or rejects submitted projects.

---

## ⚙️ Technologies
| Tool | Purpose |
|------|---------|
| NestJS | Backend framework |
| AWS Cognito | Authentication and User Pool management |
| Serverless Framework | Deployment and infrastructure as code |
| TypeORM | ORM for PostgreSQL |
| PostgreSQL (RDS) | Relational database |
| AWS Lambda | Serverless function execution |
| AWS API Gateway | HTTP endpoint exposure |

---

## 🧩 Modules

### 1. **Auth Module**
Handles user authentication and authorization using AWS Cognito.

#### Services:
- `AuthService`: Manages authentication flows
  - `signUp`: Creates new user in both database and Cognito
  - `signIn`: Authenticates user and returns tokens
  - `refreshToken`: Refreshes access tokens
  - `confirmSignUp`: Confirms user registration
  - `forgotPassword`: Initiates password reset
  - `resetPassword`: Resets user password
  - `resendVerificationCode`: Resends verification code

#### DTOs:
- `SignUpDto`
- `SignInDto`
- `RefreshTokenDto`
- `ConfirmSignUpDto`
- `ForgotPasswordDto`
- `ResetPasswordDto`
- `ResendVerificationDto`

#### Endpoints:
- `POST /auth/signup`: Register new user
- `POST /auth/signin`: Authenticate user
- `POST /auth/refresh`: Refresh access token
- `POST /auth/confirm`: Confirm registration
- `POST /auth/forgot-password`: Request password reset
- `POST /auth/reset-password`: Reset password
- `POST /auth/resend-verification`: Resend verification code

---

### 2. **Projects Module**
Manages real estate project lifecycle: submission, listing, review, and approval.

#### Entity: `Project`
```ts
id: string;
name: string;
location: string;
landArea: number;
estimatedCost: number;
expectedRevenue: number;
description?: string;
status: 'pending' | 'approved' | 'rejected';
createdAt: Date;
createdById: string; // User ID
```

#### Services:
- `ProjectsService`
  - `create`: Create new project
  - `findAll`: List projects (all for admin, own for developer)
  - `findOne`: Get project details
  - `updateStatus`: Update project status (admin only)

#### DTOs:
- `CreateProjectDto`
- `UpdateProjectStatusDto`

#### Endpoints:
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST   | /projects | Developer | Create new project |
| GET    | /projects | All | List own (developer) or all (admin) projects |
| GET    | /projects/:id | Owner/Admin | Get details of one project |
| PATCH  | /projects/:id/status | Admin | Update project status |

---

## 🔐 Authorization & Auth Flow
1. User registration:
   - User signs up via `/auth/signup`
   - Account created in both database and Cognito
   - Verification code sent to email
   - User confirms registration via `/auth/confirm`

2. Authentication:
   - User signs in via `/auth/signin`
   - Returns access token, ID token, and refresh token
   - Tokens used for subsequent API requests

3. Token Management:
   - Access tokens expire after 1 hour
   - Refresh tokens valid for 30 days
   - `/auth/refresh` endpoint to get new access tokens

4. Password Management:
   - Forgot password flow via `/auth/forgot-password`
   - Reset password via `/auth/reset-password`
   - Verification code required for reset

---

## 🧪 Validation & Error Handling
- Input validation via `class-validator`
- Custom exceptions for specific error cases:
  - `UserAlreadyExistsException`
  - `CognitoSignUpException`
  - `DatabaseTransactionException`
- Global exception filter for consistent error responses
- Detailed logging for debugging and monitoring

---

## 📦 Deployment (Serverless Framework)

### serverless.yml highlights:
```yaml
service: captal-api
frameworkVersion: '4'
useDotenv: true

plugins:
  - serverless-offline
  - serverless-dotenv-plugin

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  architecture: arm64
  memorySize: ${self:custom.stages.${opt:stage, 'development'}.memory}
  deploymentMethod: direct
  logRetentionInDays: ${self:custom.stages.${opt:stage}.logRetentionInDays}
  environment:
    PORT: 5000
  apiGateway:
    binaryMediaTypes:
      - 'image/png'
      - 'image/jpeg'
      - 'image/heif'
      - 'multipart/form-data'
  logs:
    restApi:
      level: ERROR
  tracing:
    apiGateway: true
    lambda: true

custom:
  dotenv:
    path: ${self:custom.stages.${opt:stage, 'development'}.envFile}
  stages:
    development:
      memory: 512
      logRetentionInDays: 5
      envFile: .env.development
    production:
      memory: 1024
      logRetentionInDays: 30
      envFile: .env.production
```

### Environment Configuration
The application uses environment-specific `.env` files:
- Development: `.env.development`
- Production: `.env.production`

Environment variables are loaded using the `serverless-dotenv-plugin` and `@nestjs/config`.

### Database Configuration
The database connection is configured with:
- SSL support (with `rejectUnauthorized: false` for development)
- AWS X-Ray integration for monitoring
- Environment variable-based configuration:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`

### Cognito Configuration
The Cognito User Pool is configured with:
- Email verification required
- Password policy:
  - Minimum length: 8 characters
  - Requires lowercase, uppercase, numbers, and symbols
- Token validity:
  - Access token: 3 hours
  - Refresh token: 720 hours (30 days)
- Custom attributes:
  - `email` (required)
  - `name` (optional)
  - `role` (optional)
  - `userId` (optional)

---

## 📚 Additional Notes
- API documentation available via Swagger (`/api/docs` route)
- Comprehensive logging for debugging and monitoring
- Transaction management for critical operations
- Secure password handling and token management
