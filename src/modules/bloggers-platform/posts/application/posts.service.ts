import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepo } from '../infra/post.repo';

@Injectable()
export class PostsService {
  constructor(private readonly postsRepo: PostsRepo) {}

  async isPostExistOrThrowNotFound(id: string): Promise<void> {
    const post = await this.postsRepo.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
  }
}
