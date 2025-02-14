import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../domain/blog.entity';
import { CreateBlogDto } from '../../dto/create-blog.dto';
import { BlogsRepo } from '../../infra/blogs.repo';
import { BlogInputDto } from '../../dto/blog-input.dto';
import { BlogPostInputDto } from '../../dto/post-input.dto';
import { PostsService } from '../../../posts/application/posts.service';
import { PostInputDto } from '../../../posts/dto/post-input.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private readonly BlogModel: BlogModelType,
    private readonly blogsRepo: BlogsRepo,
    private readonly postsService: PostsService,
  ) {}

  async create(dto: CreateBlogDto): Promise<string> {
    const blog = this.BlogModel.createInstance(dto);
    await this.blogsRepo.save(blog);
    return blog.id;
  }

  async createPost(blogId: string, dto: BlogPostInputDto): Promise<string> {
    const blog = await this.blogsRepo.findById(blogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    const createPostDto: PostInputDto = { ...dto, blogId: blog.id };
    return this.postsService.create(createPostDto);
  }

  async update(id: string, dto: BlogInputDto): Promise<void> {
    const blog = await this.blogsRepo.findById(id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    blog.update(dto);
    await this.blogsRepo.save(blog);
  }

  async delete(id: string): Promise<void> {
    const blog = await this.blogsRepo.findById(id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    blog.makeDeleted();
    await this.blogsRepo.save(blog);
  }

  async checkBlogExistOrThrowNotFound(id: string): Promise<void> {
    const blog = await this.blogsRepo.findById(id);
    // TODO: replace with domain exception
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
  }
}
