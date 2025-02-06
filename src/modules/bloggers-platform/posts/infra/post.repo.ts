import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/post.entity';

@Injectable()
export class PostsRepo {
  constructor(
    @InjectModel(Post.name) private readonly PostModel: PostModelType,
  ) {}

  async save(blog: PostDocument): Promise<void> {
    await blog.save();
  }

  async findById(id: string): Promise<PostDocument | null> {
    return this.PostModel.findOne({ _id: id, deletedAt: null });
  }
}
