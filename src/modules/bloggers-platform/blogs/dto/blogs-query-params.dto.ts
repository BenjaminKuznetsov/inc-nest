import { BaseSortablePaginationParams } from '../../../../core/dto/base.query-params.input-dto';

enum BlogsSortBy {
  Name = 'name',
  Description = 'description',
  WebsiteUrl = 'websiteUrl',
  IsMembership = 'isMembership',
  CreatedAt = 'createdAt',
}

// dto для запроса списка блогов с пагинацией, сортировкой, фильтрами
export class GetBlogsQueryParams extends BaseSortablePaginationParams<BlogsSortBy> {
  sortBy = BlogsSortBy.CreatedAt;
  searchNameTerm: string | null = null;
}
