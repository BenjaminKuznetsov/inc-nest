import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { GetPostsQueryParams } from '../dto/posts-query-params.dto';
import { PostViewDto } from '../dto/post-view.dto';
import { isValidObjectId } from '../../../../core/utils/objectId';

@Injectable()
export class PostsQueryRepo {
  constructor(@InjectModel(Post.name) private readonly PostModel: PostModelType) {}

  async getAll(query: GetPostsQueryParams): Promise<PaginatedViewDto<PostViewDto>> {
    const filter: FilterQuery<Post> = {
      deletedAt: null,
    };

    if (query.blogId) {
      filter.blogId = query.blogId;
    }

    const result = await this.PostModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.PostModel.countDocuments(filter);

    return PaginatedViewDto.mapToView({
      items: result.map((blog) => PostViewDto.mapToView(blog)),
      totalCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
    });
  }

  async getById(id: string): Promise<PostViewDto> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Post not found');
    }

    const post = await this.PostModel.findOne({ _id: id, deletedAt: null });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return PostViewDto.mapToView(post);
  }
}
