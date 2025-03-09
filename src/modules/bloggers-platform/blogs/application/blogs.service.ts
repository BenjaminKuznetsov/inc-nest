import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsRepo } from '../infra/blogs.repo';
import { BlogDocument } from '../domain/blog.entity';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepo: BlogsRepo) {}

  async findByIdOrThrowNotFound(id: string): Promise<BlogDocument> {
    const blog = await this.blogsRepo.findById(id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return blog;
  }
}
