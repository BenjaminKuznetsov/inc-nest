import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Ip, Post, Req, Res, UseGuards } from '@nestjs/common';
import { paths } from '../../../common/paths';
import { AuthService } from '../application/auth.service';
import { UserId } from '../../../core/decorators/userId';
import { UsersQueryRepo } from '../infrastructure/users-query.repo';
import { BearerAuthGuard } from './guards/bearer-auth.guard';
import { LoginInputDto } from './input-dto/login.input-dto';
import { MeViewDto } from './view-dto/me.view-dto';
import { LoginViewDto } from './view-dto/login.view-dto';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { RegistrationConfirmationInputDto } from './input-dto/registration-confirmation.input-dto';
import { EmailInputDto } from './input-dto/email.input-dto';
import { ChangePasswordInputDto } from './input-dto/change-password.input-dto';
import { appConfig } from '../../../common/config/config';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersQueryRepo: UsersQueryRepo,
  ) {}

  @UseGuards(BearerAuthGuard)
  @Get(paths.auth.subs.me)
  async getMe(@UserId() userId: string): Promise<MeViewDto> {
    return this.usersQueryRepo.getMe(userId);
  }

  @Post(paths.auth.subs.login)
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() input: LoginInputDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res() res: Response,
  ): Promise<LoginViewDto> {
    const result = await this.authService.loginUser({
      loginOrEmail: input.loginOrEmail,
      password: input.password,
      ip,
      userAgent,
    });

    res.cookie(appConfig.cookieNames.refreshToken, result.refreshToken, { httpOnly: true, secure: true });
    return { accessToken: result.accessToken };
  }

  @Post(paths.auth.subs.registration)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() input: CreateUserInputDto) {
    return this.authService.userRegistration(input);
  }

  @Post(paths.auth.subs.registrationConfirmation)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() input: RegistrationConfirmationInputDto) {
    return this.authService.confirmUserRegistration(input.code);
  }

  @Post(paths.auth.subs.registrationEmailResending)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() input: EmailInputDto) {
    return this.authService.resendUserConfirmationEmail(input.email);
  }

  @Post(paths.auth.subs.passwordRecovery)
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() input: EmailInputDto) {
    return this.authService.passwordRecovery(input.email);
  }

  @Post(paths.auth.subs.newPassword)
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() input: ChangePasswordInputDto) {
    return this.authService.newPassword(input);
  }

  // @Post(paths.auth.subs.refresh)
  // async refresh() {
  //   return {};
  // }

  @Post(paths.auth.subs.logout)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken: string = req.cookies.refreshToken;
    await this.authService.logOutUser(refreshToken);
    res.clearCookie(appConfig.cookieNames.refreshToken, {});
  }
}
