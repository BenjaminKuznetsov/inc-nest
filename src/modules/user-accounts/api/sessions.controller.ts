import { Controller, Delete, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RefreshTokenAuthGuard } from '../../../core/guards/refresh-token-auth.guard';
import { User } from '../../../core/decorators/user';
import { GetUserSessionsQuery } from '../application/queries/get-user-sessions.query-handler';
import { TerminateAllOtherSessionsCommand } from '../application/use-cases/terminate-all-other-sessions.use-case';
import { TerminateOneSessionCommand } from '../application/use-cases/terminate-one-session.use-case';

@Controller('security/devices')
@UseGuards(RefreshTokenAuthGuard)
export class SessionsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getDevices(@User('id') userId: string) {
    return this.queryBus.execute(new GetUserSessionsQuery(userId));
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateAllOtherSessions(@User('id') userId: string, @User('deviceId') deviceId: string) {
    return this.commandBus.execute(new TerminateAllOtherSessionsCommand(userId, deviceId));
  }

  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateCurrentSession(@Param('deviceId') deviceId: string, @User('id') userId: string) {
    return this.commandBus.execute(new TerminateOneSessionCommand(userId, deviceId));
  }
}
