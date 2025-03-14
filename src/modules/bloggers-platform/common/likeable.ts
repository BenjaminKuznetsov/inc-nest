import { LikeStatus } from '../likes/domain/like.entity';

export enum LikableEntity {
  Post,
  Comment,
}

export abstract class Likeable {
  abstract likesCount: number;
  abstract dislikesCount: number;

  calculateLikesCount(newStatus: LikeStatus, prevStatus: LikeStatus | null) {
    if (prevStatus === newStatus) {
      return;
    }

    if (prevStatus === LikeStatus.None || !prevStatus) {
      if (newStatus === LikeStatus.Like) {
        this.likesCount += 1;
      }
      if (newStatus === LikeStatus.Dislike) {
        this.dislikesCount += 1;
      }
    }

    if (prevStatus === LikeStatus.Like) {
      if (newStatus === LikeStatus.None) {
        this.likesCount -= 1;
      }
      if (newStatus === LikeStatus.Dislike) {
        this.likesCount -= 1;
        this.dislikesCount += 1;
      }
    }
    if (prevStatus === LikeStatus.Dislike) {
      if (newStatus === LikeStatus.None) {
        this.dislikesCount -= 1;
      }
      if (newStatus === LikeStatus.Like) {
        this.dislikesCount -= 1;
        this.likesCount += 1;
      }
    }
  }
}
