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
import { GetPostsQueryParams } from '../dto/posts-query-params.dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../dto/post-view.dto';
import { PostInputDto } from '../dto/post-input.dto';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepo } from '../infra/post.query-repo';
import { GetCommentsQueryParams } from '../../comments/dto/comments-query-params.dto';
import { CommentsQueryRepo } from '../../comments/infra/comment.query-repo';
import { BasicAuthGuard } from '../../../../core/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/use-cases/create-post.use-case';
import { UpdatePostCommand } from '../application/use-cases/update-post.use-case';
import { DeletePostCommand } from '../application/use-cases/delete-post.use-case';
import { User } from '../../../../core/decorators/user';
import { CommentInputDto } from '../../comments/api/dto/comment-input.dto';
import { CreateCommentCommand } from '../../comments/application/use-cases/create-comment.use-case';
import { BearerAuthGuard } from '../../../../core/guards/bearer-auth.guard';
import { LikeInputDTO } from '../../likes/dto/like.input-dto';
import { CreateOrUpdateLikeCommand } from '../../likes/application/use-cases/create-or-update-like.use-case';
import { LikableEntity } from '../../common/likeable';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postsService: PostsService,
    private readonly postsQueryRepo: PostsQueryRepo,
    private readonly commentsQueryRepo: CommentsQueryRepo,
  ) {}

  @Get()
  getAll(@Query() query: GetPostsQueryParams): Promise<PaginatedViewDto<PostViewDto>> {
    return this.postsQueryRepo.getAll(query);
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<PostViewDto> {
    return this.postsQueryRepo.getById(id);
  }

  @Get(':id/comments')
  async getPosts(@Param('id') postId: string, @Query() query: GetCommentsQueryParams, @User('id') userId?: string) {
    await this.postsService.isPostExistOrThrowNotFound(postId);
    query.postId = postId;
    return this.commentsQueryRepo.getAll(query, userId);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async create(@Body() dto: PostInputDto): Promise<PostViewDto> {
    const postId = await this.commandBus.execute(new CreatePostCommand(dto));
    return this.postsQueryRepo.getById(postId);
  }

  @Post(':id/comments')
  @UseGuards(BearerAuthGuard)
  async createComment(@Param('id') postId: string, @User('id') userId: string, @Body() dto: CommentInputDto) {
    await this.postsService.isPostExistOrThrowNotFound(postId);
    return this.commandBus.execute(new CreateCommentCommand(postId, userId, dto.content));
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  update(@Param('id') id: string, @Body() dto: PostInputDto) {
    return this.commandBus.execute(new UpdatePostCommand(id, dto));
  }

  @Put(':id/like-status')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  handleLikeStatus(@Param('id') postId: string, @User('id') userId: string, @Body() input: LikeInputDTO) {
    return this.commandBus.execute(new CreateOrUpdateLikeCommand(LikableEntity.Post, postId, userId, input.likeStatus));
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.commandBus.execute(new DeletePostCommand(id));
  }
}
