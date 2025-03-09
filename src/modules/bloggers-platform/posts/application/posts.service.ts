import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private readonly PostModel: PostModelType) {}

  async isPostExistOrThrowNotFound(id: string): Promise<void> {
    // TODO: move to repository ???
    const post = await this.PostModel.exists({ _id: id, deletedAt: null });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
  }
}
