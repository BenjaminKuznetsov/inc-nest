import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from '../../application/blogs/blogs.service';
import { BlogsQueryRepo } from '../../infra/blogs.query-repo';
import { GetBlogsQueryParams } from '../../dto/blogs-query-params.dto';
import { BlogViewDto } from '../../dto/blog-view.dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { BlogInputDto } from '../../dto/blog-input.dto';
import { BlogPostInputDto } from '../../dto/post-input.dto';
import { PostsQueryRepo } from '../../../posts/infra/post.query-repo';
import { PostViewDto } from '../../../posts/dto/post-view.dto';
import { GetPostsQueryParams } from '../../../posts/dto/posts-query-params.dto';
import { BasicAuthGuard } from '../../../../../core/guards/basic-auth.guard';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepo: BlogsQueryRepo,
    private readonly postsQueryRepo: PostsQueryRepo,
  ) {}

  @Get()
  getAll(@Query() query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto>> {
    return this.blogsQueryRepo.getAll(query);
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<BlogViewDto> {
    return this.blogsQueryRepo.getById(id);
  }

  @Get(':blogId/posts')
  async getPosts(@Param('blogId') blogId: string, @Query() query: GetPostsQueryParams) {
    await this.blogsService.checkBlogExistOrThrowNotFound(blogId);
    query.blogId = blogId;
    return this.postsQueryRepo.getAll(query);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async create(@Body() dto: BlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.blogsService.create(dto);
    return this.blogsQueryRepo.getById(blogId);
  }

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  async createPost(@Param('blogId') blogId: string, @Body() dto: BlogPostInputDto): Promise<PostViewDto> {
    const postId = await this.blogsService.createPost(blogId, dto);
    return this.postsQueryRepo.getById(postId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  update(@Param('id') id: string, @Body() dto: BlogInputDto) {
    return this.blogsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  delete(@Param('id') id: string) {
    return this.blogsService.delete(id);
  }
}
