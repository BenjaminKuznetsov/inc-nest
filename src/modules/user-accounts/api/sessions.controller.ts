import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersQueryRepo } from '../infrastructure/users-query.repo';
import { UserAccountsConfig } from '../config/user-accounts.config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RefreshTokenAuthGuard } from '../../../core/guards/refresh-token-auth.guard';
import { User } from '../../../core/decorators/user';
import { GetUserSessionsQuery } from '../application/queries/get-user-sessions.query-handler';

@Controller('security/devices')
@UseGuards(RefreshTokenAuthGuard)
export class SessionsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly config: UserAccountsConfig,
    private readonly usersQueryRepo: UsersQueryRepo,
  ) {}

  @Get()
  async getDevices(@User('id') userId: string) {
    return this.queryBus.execute(new GetUserSessionsQuery(userId));
  }
}
