import { Controller, Get, Module } from "@nestjs/common";
import { UsersService } from "./users/users.service";

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
    controllers: [HealthController],
    providers: [UsersService],
})
export class AppModule {}