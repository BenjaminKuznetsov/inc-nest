import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { CommentRepo } from '../../infra/comment.repo';
import { CommentViewDto } from '../../dto/comment-view.dto';
import { CommentsQueryRepo } from '../../infra/comment.query-repo';

export class CreateCommentCommand {
  constructor(
    public postId: string,
    public userId: string,
    public content: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    @InjectModel(Comment.name) private readonly CommentModel: CommentModelType,
    private readonly commentRepo: CommentRepo,
    private readonly commentsQueryRepo: CommentsQueryRepo,
  ) {}

  async execute({ postId, userId, content }: CreateCommentCommand): Promise<CommentViewDto> {
    const comment = this.CommentModel.createInstance({
      content: content,
      commentatorId: userId,
      postId,
    });

    await this.commentRepo.save(comment);

    return this.commentsQueryRepo.getById(comment.id, userId);
  }
}
