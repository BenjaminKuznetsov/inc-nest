import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeDocument, LikeModelType, LikeStatus } from '../domain/like.entity';
import { User, UserDocument, UserModelType } from '../../../user-accounts/domain/user.entity';

type PopulatedLikeDocument = Omit<LikeDocument, 'authorId'> & { authorId: UserDocument };

@Injectable()
export class LikesRepo {
  constructor(
    @InjectModel(Like.name) private LikeModel: LikeModelType,
    @InjectModel(User.name) private UserModel: UserModelType,
  ) {}

  async save(like: LikeDocument) {
    await like.save();
  }

  async getLikeByMetadata(parentId: string, authorId: string): Promise<LikeDocument | null> {
    return this.LikeModel.findOne({ parentId, authorId });
  }

  async getCountByParentId(parentId: string, status: LikeStatus): Promise<number> {
    return this.LikeModel.countDocuments({ parentId, status });
  }

  async getLastThreeLikesByPostId(postId: string): Promise<PopulatedLikeDocument[]> {
    const likes = await this.LikeModel.find({
      parentId: postId,
      status: LikeStatus.Like,
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate({ path: 'authorId', model: User.name });

    return likes as unknown as PopulatedLikeDocument[];
  }
}
