import { PostDocument } from '../domain/post.entity';
import { LikeStatus } from '../../likes/domain/like.entity';

export class ExtendedLikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: Array<{
    addedAt: string;
    userId: string;
    login: string;
  }>;
}

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfo;

  static mapToView(post: PostDocument, likesInfo: ExtendedLikesInfo): PostViewDto {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: likesInfo,
    };
  }
}
