import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { GetPostsQueryParams } from '../dto/posts-query-params.dto';
import { ExtendedLikesInfo, PostViewDto } from '../dto/post-view.dto';
import { isValidObjectId } from '../../../../core/utils/objectId';
import { LikesRepo } from '../../likes/infra/likes.repo';
import { LikeStatus } from '../../likes/domain/like.entity';
import { LikesService } from '../../likes/application/likes.service';

@Injectable()
export class PostsQueryRepo {
  constructor(
    @InjectModel(Post.name) private readonly PostModel: PostModelType,
    private readonly likesService: LikesService,
    private readonly likesRepo: LikesRepo,
  ) {}

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

    const withLikesInfo = await Promise.all(
      result.map(async (post) => {
        const likesInfo = await this.getLikesInfo(post, query.userId);
        return { post, likesInfo };
      }),
    );

    return PaginatedViewDto.mapToView({
      items: withLikesInfo.map(({ post, likesInfo }) => PostViewDto.mapToView(post, likesInfo)),
      totalCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
    });
  }

  async getById(id: string, userId?: string): Promise<PostViewDto> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Post not found');
    }

    const post = await this.PostModel.findOne({ _id: id, deletedAt: null });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const likesInfo = await this.getLikesInfo(post, userId);

    return PostViewDto.mapToView(post, likesInfo);
  }

  private async getLikesInfo(post: PostDocument, userId?: string): Promise<ExtendedLikesInfo> {
    const likesCount = post.likesCount;
    const dislikesCount = post.dislikesCount;

    const userStatus = await this.likesService.getUserLikeStatus(post.id, userId);

    const newestLikes = await this.likesRepo.getLastThreeLikesByPostId(post.id);

    const mappedNewestLikes = newestLikes.map((like) => ({
      addedAt: like.createdAt.toISOString(),
      userId: like.authorId._id.toString(),
      login: like.authorId.login,
    }));

    return {
      likesCount,
      dislikesCount,
      myStatus: userStatus,
      newestLikes: mappedNewestLikes,
    };
  }
}
