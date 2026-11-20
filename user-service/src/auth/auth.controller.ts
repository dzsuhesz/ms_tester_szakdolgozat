import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}