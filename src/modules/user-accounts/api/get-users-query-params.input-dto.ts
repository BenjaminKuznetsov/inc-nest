//dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами
import { BaseSortablePaginationParams } from '../../../core/dto/base.query-params.input-dto';

enum UsersSortBy {
  Login = 'login',
  Email = 'email',
  CreatedAt = 'createdAt',
}

export class GetUsersQueryParams extends BaseSortablePaginationParams<UsersSortBy> {
  sortBy = UsersSortBy.CreatedAt;
  searchLoginTerm: string | null = null;
  searchEmailTerm: string | null = null;
}
