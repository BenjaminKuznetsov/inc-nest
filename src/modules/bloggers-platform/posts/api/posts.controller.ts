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
} from '@nestjs/common';
import { GetPostsQueryParams } from '../dto/posts-query-params.dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../dto/post-view.dto';
import { PostInputDto } from '../dto/post-input.dto';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepo } from '../infra/post.query-repo';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepo: PostsQueryRepo,
  ) {}

  @Get()
  getAll(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto>> {
    return this.postsQueryRepo.getAll(query);
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<PostViewDto> {
    return this.postsQueryRepo.getById(id);
  }

  @Get(':postId/comments')
  getPosts(@Param('postId') postId: string) {
    return 'getComments';
  }

  @Post()
  async create(@Body() dto: PostInputDto): Promise<PostViewDto> {
    const postId = await this.postsService.create(dto);
    return this.postsQueryRepo.getById(postId);
  }

  @Post(':postId/comments')
  createPost(@Param('postId') postId: string) {
    return 'create comment';
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(@Param('id') id: string, @Body() dto: PostInputDto) {
    return this.postsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.postsService.delete(id);
  }
}
