import { Types } from 'mongoose';

export class CommentCreateDto {
  content: string;
  commentatorId: Types.ObjectId;
  postId: Types.ObjectId;
}
