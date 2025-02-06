import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';
import { PostInputDto } from '../dto/post-input.dto';
import { BlogsRepo } from '../../blogs/infra/blogs.repo';
import { PostsRepo } from '../infra/post.repo';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly PostModel: PostModelType,
    private readonly postsRepo: PostsRepo,
    private readonly blogsRepo: BlogsRepo,
  ) {}

  async create(dto: PostInputDto): Promise<string> {
    const blog = await this.blogsRepo.findById(dto.blogId);
    // TODO add validation
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    const post = this.PostModel.createInstance(dto, blog);
    await this.postsRepo.save(post);
    return post.id;
  }

  async update(id: string, dto: PostInputDto): Promise<void> {
    const post = await this.postsRepo.findById(id);
    if (!post) {
      throw new NotFoundException('Blog not found');
    }
    post.update(dto);
    await this.postsRepo.save(post);
  }

  async delete(id: string): Promise<void> {
    const post = await this.postsRepo.findById(id);
    if (!post) {
      throw new NotFoundException('Blog not found');
    }
    post.makeDeleted();
    await this.postsRepo.save(post);
  }
}
