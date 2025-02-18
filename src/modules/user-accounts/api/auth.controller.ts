import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Ip, Post, UseGuards } from '@nestjs/common';
import { paths } from '../../../common/paths';
import { AuthService } from '../application/auth.service';
import { UserId } from '../../../core/decorators/userId';
import { UsersQueryRepo } from '../infrastructure/users-query.repo';
import { BearerAuthGuard } from './guards/bearer-auth.guard';
import { LoginInputDto } from './input-dto/login.input-dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersQueryRepo: UsersQueryRepo,
  ) {}

  @UseGuards(BearerAuthGuard)
  @Get(paths.auth.subs.me)
  async getMe(@UserId() userId: string) {
    return this.usersQueryRepo.getMe(userId);
  }

  @Post(paths.auth.subs.login)
  @HttpCode(HttpStatus.OK)
  async login(@Body() input: LoginInputDto, @Ip() ip: string, @Headers('user-agent') userAgent: string) {
    const result = await this.authService.loginUser({
      loginOrEmail: body.loginOrEmail,
      password: body.password,
      ip,
      userAgent,
    });
    return { accessToken: result.data.accessToken };
  }

  @Post(paths.auth.subs.passwordRecovery)
  async passwordRecovery() {
    return {};
  }

  @Post(paths.auth.subs.newPassword)
  async newPassword() {
    return {};
  }

  @Post(paths.auth.subs.refresh)
  async refresh() {
    return {};
  }

  @Post(paths.auth.subs.logout)
  async logout() {
    return {};
  }
  @Post(paths.auth.subs.register)
  async register() {
    return {};
  }

  @Post(paths.auth.subs.registerConfirm)
  async registerConfirm() {
    return {};
  }

  @Post(paths.auth.subs.registerEmailResend)
  async registerEmailResend() {
    return {};
  }
}
