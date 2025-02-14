import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';
import { BlogDocument } from '../../blogs/domain/blog.entity';
import { Post } from '../../posts/domain/post.entity';
import { CommentCreateDto } from '../dto/comment-create.dto';

@Schema({ timestamps: true })
export class Comment {
  /**
   * The content of the comment
   * @type {string}
   */
  @Prop({ type: String, required: true })
  content: string;

  /**
   * The id of the user who created the comment
   * @type {Types.ObjectId}
   */
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  commentatorId: Types.ObjectId;

  /**
   * The id of the post to which the comment is attached
   * @type {Types.ObjectId}
   */
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  postId: Types.ObjectId;

  /**
   * The number of likes on the comment
   * @type {number}
   */
  @Prop({ type: Number, default: 0 })
  likesCount: number;

  /**
   * The number of dislikes on the comment
   * @type {number}
   */
  @Prop({ type: Number, default: 0 })
  dislikesCount: number;

  /**
   * Deletion timestamp, nullable, if date exist, means entity soft deleted
   * @type {Date | null}
   */
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   * properties without @Prop for typescript so that they are in the class instance (or in instance methods)
   * @type {Date}
   */
  createdAt: Date;
  updatedAt: Date;

  /**
   * Virtual property to get the stringified ObjectId
   * @returns {string} The string representation of the ID
   */
  get id(): string {
    // @ts-ignore
    return this._id.toString();
  }

  static createInstance(
    dto: CommentCreateDto,
    blog: BlogDocument,
  ): CommentDocument {
    const comment = new this();
    comment.content = dto.content;
    comment.commentatorId = dto.commentatorId;
    comment.postId = dto.postId;

    return comment as CommentDocument;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelType = Model<CommentDocument> & typeof Post;
