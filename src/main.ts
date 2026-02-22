import 'dotenv/config'; // ✅ MUST BE FIRST
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as express from 'express'; // ✅ ADD THIS

async function bootstrap() {

  // ✅ CREATE UPLOAD DIRECTORY (IMPORTANT)
  const uploadDir = './uploads/payments';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    // console.log('📁 Created upload directory:', uploadDir);
  }

  const app = await NestFactory.create(AppModule);

  // ✅ SERVE UPLOADS PUBLICLY (IMPORTANT)
  // app.use('/uploads', express.static('uploads'));

  const bcrypt = require('bcrypt');
  bcrypt.hash("Creations@2025", 10).then(console.log);

  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('MS Creation API')
    .setVersion('1.0')
    .build();

  app.enableCors({ origin: true, credentials: true });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}
bootstrap();
