import { Controller, Get, Module } from "@nestjs/common";
import { UsersService } from "./users/users.service";
import { AuthController } from "./auth/auth.controller";
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from "./users/users.controller";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";

@Controller('health')
export class HealthController {
    @Get()
    check() {
        return { status: 'ok', service: 'user-service' }
    }
    @Get('version')
    version() {
        return { version: '1.0'}
    }
}

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
            signOptions: { expiresIn: '1h', algorithm: 'HS256' },
            verifyOptions: { algorithms: ['HS256'] },
        }),
    ],
    controllers: [HealthController, AuthController, UsersController],
    providers: [UsersService, AuthService, JwtAuthGuard],
})
export class AppModule {}