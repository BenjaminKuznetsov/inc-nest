import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';
import { PostInputDto } from '../dto/post-input.dto';
import { BlogsRepo } from '../../blogs/infra/blogs.repo';
import { PostsRepo } from '../infra/post.repo';
import { CustomBadRequestException } from '../../../../common/exception/bad-request';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly PostModel: PostModelType,
    private readonly postsRepo: PostsRepo,
    private readonly blogsRepo: BlogsRepo,
  ) {}

  async create(dto: PostInputDto): Promise<string> {
    const blog = await this.blogsRepo.findById(dto.blogId);
    if (!blog) {
      throw new CustomBadRequestException({ field: 'blogId', message: 'Blog not found' });
    }
    const post = this.PostModel.createInstance(dto, blog);
    await this.postsRepo.save(post);
    return post.id;
  }

  async update(id: string, dto: PostInputDto): Promise<void> {
    const blog = await this.blogsRepo.findById(dto.blogId);
    if (!blog) {
      throw new CustomBadRequestException({ field: 'blogId', message: 'Blog not found' });
    }
    const post = await this.postsRepo.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
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

  async isPostExistOrThrowNotFound(id: string): Promise<void> {
    const post = await this.PostModel.exists({ _id: id, deletedAt: null });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
  }
}
