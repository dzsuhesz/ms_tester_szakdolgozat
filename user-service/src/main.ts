import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    configureApp(app);

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`user-service listening on port ${port}`);
}

bootstrap();