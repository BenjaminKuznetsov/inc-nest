import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { BlogInputDto } from '../dto/blog-input.dto';

@Schema({ timestamps: true })
export class Blog {
  /**
   * The name of the blog.
   * @type {string}
   */
  @Prop({ type: String, required: true })
  name: string;

  /**
   * The description of the blog.
   * @type {string}
   */
  @Prop({ type: String, required: true })
  description: string;

  /**
   * The website URL of the blog.
   * @type {string}
   */
  @Prop({ type: String, required: true })
  websiteUrl: string;

  /**
   * Is membership.
   * Пока всегда false
   * @type {boolean}
   */
  @Prop({ type: Boolean, default: false })
  isMembership: boolean;

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
   * @returns {BlogDocument} The created blog document.
   */
  static createInstance(dto: CreateBlogDto): BlogDocument {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = dto.isMembership || false;

    return blog as BlogDocument;
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

  update(dto: BlogInputDto) {
    Object.assign(this, dto);
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.loadClass(Blog);

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModelType = Model<BlogDocument> & typeof Blog;
