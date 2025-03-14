import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Put, UseGuards } from '@nestjs/common';
import { CommentViewDto } from '../dto/comment-view.dto';
import { CommentsQueryRepo } from '../infra/comment.query-repo';
import { User } from '../../../../core/decorators/user';
import { BearerAuthGuard } from '../../../../core/guards/bearer-auth.guard';
import { CommentInputDto } from './dto/comment-input.dto';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/use-cases/update-comment.use-case';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment.use-case';
import { LikeInputDTO } from '../../likes/dto/like.input-dto';
import { CreateOrUpdateLikeCommand } from '../../likes/application/use-cases/create-or-update-like.use-case';
import { LikableEntity } from '../../common/likeable';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly commentsQueryRepo: CommentsQueryRepo,
  ) {}

  @Get(':id')
  getById(@Param('id') id: string, @User('id') userId?: string): Promise<CommentViewDto> {
    return this.commentsQueryRepo.getById(id, userId);
  }

  @Put(':id')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @User('id') userId: string, @Body() dto: CommentInputDto) {
    return this.commandBus.execute(new UpdateCommentCommand(id, userId, dto.content));
  }

  @Put(':id/like-status')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  handleLikeStatus(@Param('id') commentId: string, @User('id') userId: string, @Body() input: LikeInputDTO) {
    return this.commandBus.execute(
      new CreateOrUpdateLikeCommand(LikableEntity.Comment, commentId, userId, input.likeStatus),
    );
  }

  @Delete(':id')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @User('id') userId: string) {
    return this.commandBus.execute(new DeleteCommentCommand(id, userId));
  }
}
