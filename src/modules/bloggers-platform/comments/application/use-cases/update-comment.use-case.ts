import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentRepo } from '../../infra/comment.repo';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public content: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(private readonly commentRepo: CommentRepo) {}

  async execute({ commentId, userId, content }: UpdateCommentCommand): Promise<void> {
    const comment = await this.commentRepo.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.commentatorId.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }

    comment.update(content);

    await this.commentRepo.save(comment);
  }
}
