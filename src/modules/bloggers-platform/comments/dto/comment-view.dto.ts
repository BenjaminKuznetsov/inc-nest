import { CommentDocument } from '../domain/comment.entity';

type LikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: 'None';
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

  static mapToView(comment: CommentDocument): CommentViewDto {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: 'string',
        userLogin: 'string',
      },
      createdAt: comment.createdAt.toISOString(),
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: 'None',
      },
    };
  }
}
