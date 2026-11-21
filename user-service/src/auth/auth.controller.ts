import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';

@Controller('auth')
export class AuthController {
  constructor(private usersService: UsersService, private authService: AuthService,) {}


  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}