import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPostsQueryParams } from '../../../posts/dto/posts-query-params.dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../../posts/dto/post-view.dto';
import { BlogsService } from '../blogs.service';
import { PostsQueryRepo } from '../../../posts/infra/post.query-repo';

export class GetPostsByBlogQuery {
  constructor(
    public blogId: string,
    public query: GetPostsQueryParams,
  ) {}
}

@QueryHandler(GetPostsByBlogQuery)
export class GetPostsByBlogQueryHandler implements IQueryHandler<GetPostsByBlogQuery, PaginatedViewDto<PostViewDto>> {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsQueryRepo: PostsQueryRepo,
  ) {}

  async execute({ blogId, query }: GetPostsByBlogQuery): Promise<PaginatedViewDto<PostViewDto>> {
    await this.blogsService.findByIdOrThrowNotFound(blogId);
    query.blogId = blogId;
    return this.postsQueryRepo.getAll(query);
  }
}
