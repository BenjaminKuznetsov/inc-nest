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
import { BlogsQueryRepo } from '../infra/blogs.query-repo';
import { GetBlogsQueryParams } from '../dto/blogs-query-params.dto';
import { BlogViewDto } from '../dto/blog-view.dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogInputDto } from '../dto/blog-input.dto';
import { BlogPostInputDto } from '../dto/post-input.dto';
import { PostsQueryRepo } from '../../posts/infra/post.query-repo';
import { PostViewDto } from '../../posts/dto/post-view.dto';
import { GetPostsQueryParams } from '../../posts/dto/posts-query-params.dto';
import { BasicAuthGuard } from '../../../../core/guards/basic-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/use-cases/create-blog.use-case';
import { UpdateBlogCommand } from '../application/use-cases/update-blog.use-case';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog.use-case';
import { CreatePostByBlogCommand } from '../application/use-cases/create-post-by-blog.use-case';
import { GetPostsByBlogQuery } from '../application/queries/get-posts-by-blog.query-handler';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
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
    return this.queryBus.execute(new GetPostsByBlogQuery(blogId, query));
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async create(@Body() dto: BlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.commandBus.execute(new CreateBlogCommand(dto));
    return this.blogsQueryRepo.getById(blogId);
  }

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard)
  async createPost(@Param('blogId') blogId: string, @Body() dto: BlogPostInputDto): Promise<PostViewDto> {
    const postId = await this.commandBus.execute(new CreatePostByBlogCommand(blogId, dto));
    return this.postsQueryRepo.getById(postId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  update(@Param('id') id: string, @Body() dto: BlogInputDto) {
    return this.commandBus.execute(new UpdateBlogCommand(id, dto));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  delete(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteBlogCommand(id));
  }
}
