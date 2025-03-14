import { LikeStatus } from '../domain/like.entity';
import { IsEnum } from 'class-validator';

export class LikeInputDTO {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
