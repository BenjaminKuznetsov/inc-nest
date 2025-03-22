import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Ip, Post, Req, Res, UseGuards } from '@nestjs/common';
import { paths } from '../../../core/paths';
import { User } from '../../../core/decorators/user';
import { UsersQueryRepo } from '../infrastructure/users-query.repo';
import { BearerAuthGuard } from '../../../core/guards/bearer-auth.guard';
import { LoginInputDto } from './input-dto/login.input-dto';
import { MeViewDto } from './view-dto/me.view-dto';
import { LoginViewDto } from './view-dto/login.view-dto';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { RegistrationConfirmationInputDto } from './input-dto/registration-confirmation.input-dto';
import { EmailInputDto } from './input-dto/email.input-dto';
import { ChangePasswordInputDto } from './input-dto/change-password.input-dto';
import { Request, Response } from 'express';
import { UserAccountsConfig } from '../config/user-accounts.config';
import { CommandBus } from '@nestjs/cqrs';
import { LoginUserCommand } from '../application/use-cases/login-user.use-case';
import { ConfirmRegistrationCommand } from '../application/use-cases/confirm-registration.use-case';
import { ResendConfirmationEmailCommand } from '../application/use-cases/resend-confirmation-email.use-case';
import { RecoverPasswordCommand } from '../application/use-cases/recover-password.use-case';
import { ChangePasswordCommand } from '../application/use-cases/change-password.use-case';
import { LogoutUserCommand } from '../application/use-cases/logout-user.use-case';
import { RegisterUserCommand } from '../application/use-cases/register-user.use-case';
import { RefreshTokenCommand } from '../application/use-cases/refresh-token.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly config: UserAccountsConfig,
    private readonly usersQueryRepo: UsersQueryRepo,
  ) {}

  @UseGuards(BearerAuthGuard)
  @Get(paths.auth.subs.me)
  async getMe(@User('id') userId: string): Promise<MeViewDto> {
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
    const result = await this.commandBus.execute(
      new LoginUserCommand({
        loginOrEmail: input.loginOrEmail,
        password: input.password,
        ip,
        userAgent,
      }),
    );

    // TODO: устанавливать куки по-нормальному
    res
      .cookie(this.config.refreshTokenCookieName, result.refreshToken, { httpOnly: true, secure: true })
      .json({ accessToken: result.accessToken });
    return { accessToken: result.accessToken };
  }

  @Post(paths.auth.subs.registration)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() input: CreateUserInputDto) {
    return this.commandBus.execute(new RegisterUserCommand(input));
  }

  @Post(paths.auth.subs.registrationConfirmation)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(@Body() input: RegistrationConfirmationInputDto) {
    return this.commandBus.execute(new ConfirmRegistrationCommand(input.code));
  }

  @Post(paths.auth.subs.registrationEmailResending)
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() input: EmailInputDto) {
    return this.commandBus.execute(new ResendConfirmationEmailCommand(input.email));
  }

  @Post(paths.auth.subs.passwordRecovery)
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() input: EmailInputDto) {
    return this.commandBus.execute(new RecoverPasswordCommand(input.email));
  }

  @Post(paths.auth.subs.newPassword)
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() input: ChangePasswordInputDto) {
    return this.commandBus.execute(new ChangePasswordCommand(input));
  }

  @Post(paths.auth.subs.refresh)
  async refreshToken(@Req() req: Request, @Res() res: Response): Promise<LoginViewDto> {
    const refreshToken: string = req.cookies.refreshToken;
    const result = await this.commandBus.execute(new RefreshTokenCommand(refreshToken));
    // TODO: устанавливать куки по-нормальному
    res
      .cookie(this.config.refreshTokenCookieName, result.refreshToken, { httpOnly: true, secure: true })
      .json({ accessToken: result.accessToken });
    return { accessToken: result.accessToken };
  }

  @Post(paths.auth.subs.logout)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken: string = req.cookies.refreshToken;
    await this.commandBus.execute(new LogoutUserCommand(refreshToken));
    res.clearCookie(this.config.refreshTokenCookieName, {});
  }
}
