import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Like, LikeModelType, LikeStatus } from '../../domain/like.entity';
import { PostDocument } from '../../../posts/domain/post.entity';
import { CommentDocument } from '../../../comments/domain/comment.entity';
import { PostsRepo } from '../../../posts/infra/post.repo';
import { CommentRepo } from '../../../comments/infra/comment.repo';
import { NotFoundException } from '@nestjs/common';
import { LikesRepo } from '../../infra/likes.repo';
import { InjectModel } from '@nestjs/mongoose';
import { LikableEntity } from '../../../common/likeable';

export class CreateOrUpdateLikeCommand {
  constructor(
    public parentType: LikableEntity,
    public parentId: string,
    public authorId: string,
    public status: LikeStatus,
  ) {}
}

@CommandHandler(CreateOrUpdateLikeCommand)
export class CreateOrUpdateLikeUseCase implements ICommandHandler<CreateOrUpdateLikeCommand> {
  constructor(
    @InjectModel(Like.name) private LikeModel: LikeModelType,
    private postsRepo: PostsRepo,
    private commentRepo: CommentRepo,
    private likesRepo: LikesRepo,
  ) {}
  async execute(command: CreateOrUpdateLikeCommand) {
    let parentEntity: PostDocument | CommentDocument | null = null;

    if (command.parentType === LikableEntity.Post) {
      parentEntity = await this.postsRepo.findById(command.parentId);
    } else if (command.parentType === LikableEntity.Comment) {
      parentEntity = await this.commentRepo.findById(command.parentId);
    }

    if (!parentEntity) {
      throw new NotFoundException();
    }

    const likeDocument = await this.likesRepo.getLikeByMetadata(command.parentId, command.authorId);

    let parentPrevLikeStatus = likeDocument?.status ?? null;

    if (likeDocument) {
      likeDocument.updateLikeStatus(command.status);
      await this.likesRepo.save(likeDocument);
      return;
    }

    const newLike = this.LikeModel.createInstance({
      status: command.status,
      authorId: command.authorId,
      parentId: command.parentId,
    });
    await this.likesRepo.save(newLike);

    parentEntity.calculateLikesCount(command.status, parentPrevLikeStatus);
    await parentEntity.save();
  }
}
