import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentViewDto } from '../dto/comment-view.dto';
import { Comment, CommentModelType } from '../domain/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { GetCommentsQueryParams } from '../dto/comments-query-params.dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';

@Injectable()
export class CommentsQueryRepo {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async getAll(
    query: GetCommentsQueryParams,
  ): Promise<PaginatedViewDto<CommentViewDto>> {
    const filter: FilterQuery<Comment> = {
      postId: query.postId,
      deletedAt: null,
    };

    const result = await this.CommentModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.CommentModel.countDocuments(filter);

    return PaginatedViewDto.mapToView({
      items: result.map((comment) => CommentViewDto.mapToView(comment)),
      totalCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
    });
  }

  async getById(id: string): Promise<CommentViewDto> {
    const comment = await this.CommentModel.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return CommentViewDto.mapToView(comment);
  }
}
