import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .addBearerAuth()
  .setTitle('Fisio Manager API')
  .setDescription('API documentation for Fisio Manager application')
  .setVersion('1.0')
  .addTag('auth', 'Authentication endpoints')
  .addTag('users', 'User management endpoints')
  .addTag('patients', 'Patient management endpoints')
  .addTag('appointments', 'Appointment management endpoints')
  .build();
