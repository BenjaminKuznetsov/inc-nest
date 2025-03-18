import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';
import { isValidObjectId } from '../../../../core/utils/objectId';

@Injectable()
export class BlogsRepo {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async save(blog: BlogDocument): Promise<void> {
    await blog.save();
  }

  async findById(id: string): Promise<BlogDocument | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    return this.BlogModel.findOne({ _id: id, deletedAt: null });
  }
}
