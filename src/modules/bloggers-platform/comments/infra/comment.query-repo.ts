import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentViewDto } from '../dto/comment-view.dto';
import { Comment, CommentModelType } from '../domain/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { GetCommentsQueryParams } from '../dto/comments-query-params.dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { UsersRepo } from '../../../user-accounts/infrastructure/usersRepo';
import { CommentRepo } from './comment.repo';
import { LikesService } from '../../likes/application/likes.service';
import { isValidObjectId } from '../../../../core/utils/objectId';

@Injectable()
export class CommentsQueryRepo {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private readonly usersRepo: UsersRepo,
    private readonly commentRepo: CommentRepo,
    private readonly likesService: LikesService,
  ) {}

  async getAll(query: GetCommentsQueryParams, userId?: string): Promise<PaginatedViewDto<CommentViewDto>> {
    const filter: FilterQuery<Comment> = {
      postId: query.postId,
      deletedAt: null,
    };

    const comments = await this.CommentModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.CommentModel.countDocuments(filter);

    const mappedComments: CommentViewDto[] = [];

    for (const comment of comments) {
      const commentator = await this.usersRepo.findById(comment.commentatorId);
      const userLikeStatus = await this.likesService.getUserLikeStatus(comment.id, userId);
      mappedComments.push(CommentViewDto.mapToView(comment, commentator!, userLikeStatus));
    }

    return PaginatedViewDto.mapToView({
      items: mappedComments,
      totalCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
    });
  }

  async getById(id: string, userId?: string): Promise<CommentViewDto> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Comment not found');
    }

    const comment = await this.commentRepo.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const commentator = await this.usersRepo.findById(comment.commentatorId);

    const userLikeStatus = await this.likesService.getUserLikeStatus(comment.id, userId);

    return CommentViewDto.mapToView(comment, commentator!, userLikeStatus);
  }
}
