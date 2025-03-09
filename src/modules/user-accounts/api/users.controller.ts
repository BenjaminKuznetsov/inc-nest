import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UsersQueryRepo } from '../infrastructure/users-query.repo';
import { UserViewDto } from './view-dto/user.view-dto';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { GetUsersQueryParams } from './get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { BasicAuthGuard } from '../../../core/guards/basic-auth.guard';
import { ValidateObjectIdPipe } from '../../../core/pipes/validate-object-id.pipe';
import { CreateUserCommand } from '../application/use-cases/create-user.use-case';
import { DeleteUserCommand } from '../application/use-cases/delete-user.use-case';
import { CommandBus } from '@nestjs/cqrs';

@Controller('users')
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private usersQueryRepository: UsersQueryRepo,
  ) {}

  @Get()
  async getAll(@Query() query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto>> {
    return this.usersQueryRepository.getAll(query);
  }

  @Post()
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const userId = await this.commandBus.execute(new CreateUserCommand(body, { isCreatedByAdmin: true }));
    return this.usersQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ValidateObjectIdPipe) id: string): Promise<void> {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}
