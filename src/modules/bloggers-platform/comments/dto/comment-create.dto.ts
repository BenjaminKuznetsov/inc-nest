import { Types } from 'mongoose';

export class CommentCreateDto {
  content: string;
  commentatorId: string;
  postId: string;
}
