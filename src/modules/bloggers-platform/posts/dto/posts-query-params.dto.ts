import { BaseSortablePaginationParams } from '../../../../core/dto/base.query-params.input-dto';

enum PostsSortBy {
  Title = 'title',
  BlogName = 'blogName',
  CreatedAt = 'createdAt',
}

// dto для запроса списка постов с пагинацией, сортировкой, фильтрами
export class GetPostsQueryParams extends BaseSortablePaginationParams<PostsSortBy> {
  sortBy = PostsSortBy.CreatedAt;
  blogId: string | null = null;
}
