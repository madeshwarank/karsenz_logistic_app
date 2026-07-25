import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { CurrentUser, Public, RequestUser } from './security';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return { data: await this.auth.login(dto.email, dto.password) };
  }

  @Public()
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return { data: await this.auth.refresh(refreshToken) };
  }

  @Post('logout')
  async logout(@CurrentUser() user: RequestUser) {
    return { data: await this.auth.logout(user.sub) };
  }
}
