import { Controller, Get, Module } from "@nestjs/common";

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
})
export class AppModule {}