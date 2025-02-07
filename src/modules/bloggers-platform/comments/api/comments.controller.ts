import { Controller, Get, Param } from '@nestjs/common';
import { CommentViewDto } from '../dto/comment-view.dto';
import { CommentsQueryRepo } from '../infra/comment.query-repo';

@Controller('comments')
export class CommentsController {
  constructor(
    // private readonly commentsService: CommentsService,
    private readonly commentsQueryRepo: CommentsQueryRepo,
  ) {}

  // @Get()
  // getAll(
  //   @Query() query: GetCommentsQueryParams,
  // ): Promise<PaginatedViewDto<CommentViewDto>> {
  //   return this.commentsQueryRepo.getAll(query);
  // }

  @Get(':id')
  getById(@Param('id') id: string): Promise<CommentViewDto> {
    return this.commentsQueryRepo.getById(id);
  }

  // @Post()
  // async create(@Body() dto: CommentInputDto): Promise<CommentViewDto> {
  //   const commentId = await this.commentsService.create(dto);
  //   return this.commentsQueryRepo.getById(commentId);
  // }
  //
  // @Put(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // update(@Param('id') id: string, @Body() dto: CommentInputDto) {
  //   return this.commentsService.update(id, dto);
  // }
  //
  // @Delete(':id')
  // delete(@Param('id') id: string) {
  //   return this.commentsService.delete(id);
  // }
}
