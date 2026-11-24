import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    configureApp(app);

    const port = process.env.PORT || 3003;
    await app.listen(port);
    console.log(`payment-service listening on port ${port}`);
}

bootstrap();