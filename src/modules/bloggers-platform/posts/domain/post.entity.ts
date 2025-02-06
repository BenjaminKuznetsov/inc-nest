import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';
import { PostInputDto } from '../dto/post-input.dto';
import { BlogDocument } from '../../blogs/domain/blog.entity';

@Schema({ timestamps: true })
export class Post {
  /**
   * The title of the post.
   * @type {string}
   */
  @Prop({ type: String, required: true })
  title: string;

  /**
   * The description of the post.
   * @type {string}
   */
  @Prop({ type: String, required: true })
  shortDescription: string;

  /**
   * The content of the post.
   * @type {string}
   */
  @Prop({ type: String, required: true })
  content: string;

  /**
   * The ID of the blog this post belongs to.
   * @type {ObjectId}
   */
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  blogId: Types.ObjectId;

  /**
   * The name of the blog this post belongs to.
   * @type {string}
   */
  @Prop({ type: String, required: true })
  blogName: string;

  /**
   * Deletion timestamp, nullable, if date exist, means entity soft deleted
   * @type {Date | null}
   */
  @Prop({ type: Date, nullable: true })
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

  /**
   * Creates a new Blog instance from the given DTO.
   * @param {CreateBlogDto} dto - The DTO containing the blog data.
   * @param {BlogDocument} blog - The blog document containing the blog data.
   * @returns {PostDocument} The created blog document.
   */
  static createInstance(dto: PostInputDto, blog: BlogDocument): PostDocument {
    const post = new this();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = blog._id;
    post.blogName = blog.name;

    return post as PostDocument;
  }

  /**
   * Marks the user as deleted
   * Throws an error if already deleted
   * @throws {Error} If the entity is already deleted
   */
  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: PostInputDto) {
    Object.assign(this, dto);
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;

export type PostModelType = Model<PostDocument> & typeof Post;
