import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import { isValidObjectId } from '../../../../core/utils/objectId';

@Injectable()
export class PostsRepo {
  constructor(@InjectModel(Post.name) private readonly PostModel: PostModelType) {}

  async save(blog: PostDocument): Promise<void> {
    await blog.save();
  }

  async findById(id: string): Promise<PostDocument | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    return this.PostModel.findOne({ _id: id, deletedAt: null });
  }
}
