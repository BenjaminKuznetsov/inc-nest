import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateLikeDto } from '../dto/create-like.dto';

export enum LikeStatus {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

@Schema({ timestamps: true })
export class Like {
  /**
   * The status of the like, can be 'Like', 'Dislike', or 'None'
   * @type {LikeStatus}
   */
  @Prop({ type: String, enum: LikeStatus, required: true })
  status: LikeStatus;

  /**
   * The ID of the user who made the like
   * @type {string}
   */
  @Prop({ type: String, required: true })
  authorId: string;

  /**
   * The ID of the entity that is being liked (comment or post)
   * @type {string}
   */
  @Prop({ type: String, required: true })
  parentId: string;

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

  static createInstance(dto: CreateLikeDto): LikeDocument {
    const like = new this();
    like.status = dto.status;
    like.authorId = dto.authorId;
    like.parentId = dto.parentId;
    return like as LikeDocument;
  }

  updateLikeStatus(newStatus: LikeStatus): void {
    this.status = newStatus;
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.loadClass(Like);

export type LikeDocument = HydratedDocument<Like>;

export type LikeModelType = Model<LikeDocument> & typeof Like;
