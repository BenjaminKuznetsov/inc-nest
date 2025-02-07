import { BaseSortablePaginationParams } from '../../../../core/dto/base.query-params.input-dto';

enum CommentSortBy {
  CreatedAt = 'createdAt',
}

// dto для запроса списка комментариев с пагинацией, сортировкой, фильтрами
export class GetCommentsQueryParams extends BaseSortablePaginationParams<CommentSortBy> {
  constructor(postId: string | null = null) {
    super();
    if (postId) {
      this.postId = postId;
    }
  }

  sortBy = CommentSortBy.CreatedAt;
  postId: string | null = null;
}
