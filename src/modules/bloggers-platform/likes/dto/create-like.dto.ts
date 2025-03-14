import { LikeStatus } from '../domain/like.entity';

export class CreateLikeDto {
  constructor(
    public status: LikeStatus,
    public authorId: string,
    public parentId: string,
  ) {}
}
