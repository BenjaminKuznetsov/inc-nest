import { CommentDocument } from '../domain/comment.entity';
import { UserDocument } from '../../../user-accounts/domain/user.entity';
import { LikeStatus } from '../../likes/domain/like.entity';

type LikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
};

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: LikesInfo;

  static mapToView(comment: CommentDocument, commentator: UserDocument, userLikeStatus: LikeStatus): CommentViewDto {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: commentator.id,
        userLogin: commentator.login,
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: userLikeStatus,
      },
    };
  }
}
