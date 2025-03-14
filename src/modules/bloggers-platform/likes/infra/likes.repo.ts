import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeDocument, LikeModelType } from '../domain/like.entity';

@Injectable()
export class LikesRepo {
  constructor(@InjectModel(Like.name) private LikeModel: LikeModelType) {}

  async save(like: LikeDocument) {
    await like.save();
  }

  async getLikeByMetadata(parentId: string, authorId: string): Promise<LikeDocument | null> {
    return this.LikeModel.findOne({ parentId, authorId });
  }
}
