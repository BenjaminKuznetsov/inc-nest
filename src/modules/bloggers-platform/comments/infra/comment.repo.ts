import { Injectable } from '@nestjs/common';
import { Comment, CommentDocument, CommentModelType } from '../domain/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId } from '../../../../core/utils/objectId';

@Injectable()
export class CommentRepo {
  constructor(@InjectModel(Comment.name) private CommentModel: CommentModelType) {}

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }

  async findById(id: string): Promise<CommentDocument | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    return this.CommentModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }
}
