import { LikesRepo } from '../infra/likes.repo';
import { LikeStatus } from '../domain/like.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LikesService {
  constructor(private likesRepo: LikesRepo) {}

  async getUserLikeStatus(parentId: string, userId?: string): Promise<LikeStatus> {
    let userLikeStatus: LikeStatus;

    if (!userId) {
      userLikeStatus = LikeStatus.None;
    } else {
      const like = await this.likesRepo.getLikeByMetadata(parentId, userId);
      if (!like) {
        userLikeStatus = LikeStatus.None;
      } else {
        userLikeStatus = like.status;
      }
    }

    return userLikeStatus;
  }
}
