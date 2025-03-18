import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsRepo } from './blogs/infra/blogs.repo';
import { BlogsQueryRepo } from './blogs/infra/blogs.query-repo';
import { PostsController } from './posts/api/posts.controller';
import { PostsService } from './posts/application/posts.service';
import { PostsRepo } from './posts/infra/post.repo';
import { PostsQueryRepo } from './posts/infra/post.query-repo';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { Post, PostSchema } from './posts/domain/post.entity';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { CommentsController } from './comments/api/comments.controller';
import { CommentsQueryRepo } from './comments/infra/comment.query-repo';
import { CreateBlogUseCase } from './blogs/application/use-cases/create-blog.use-case';
import { CreatePostByBlogUseCase } from './blogs/application/use-cases/create-post-by-blog.use-case';
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog.use-case';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog.use-case';
import { GetPostsByBlogQueryHandler } from './blogs/application/queries/get-posts-by-blog.query-handler';
import { CreatePostUseCase } from './posts/application/use-cases/create-post.use-case';
import { DeletePostUseCase } from './posts/application/use-cases/delete-post.use-case';
import { UpdatePostUseCase } from './posts/application/use-cases/update-post.use-case';
import { CommentRepo } from './comments/infra/comment.repo';
import { CreateCommentUseCase } from './comments/application/use-cases/create-comment.use-case';
import { UpdateCommentUseCase } from './comments/application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from './comments/application/use-cases/delete-comment.use-case';
import { LikesService } from './likes/application/likes.service';
import { LikesRepo } from './likes/infra/likes.repo';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { Like, LikeSchema } from './likes/domain/like.entity';
import { CreateOrUpdateLikeUseCase } from './likes/application/use-cases/create-or-update-like.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Like.name, schema: LikeSchema },
    ]),
    UserAccountsModule,
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    BlogsRepo,
    BlogsQueryRepo,
    PostsService,
    PostsRepo,
    PostsQueryRepo,
    CommentRepo,
    CommentsQueryRepo,
    LikesService,
    LikesRepo,
    CreateBlogUseCase,
    CreatePostByBlogUseCase,
    DeleteBlogUseCase,
    UpdateBlogUseCase,
    GetPostsByBlogQueryHandler,
    CreatePostUseCase,
    DeletePostUseCase,
    UpdatePostUseCase,
    CreateCommentUseCase,
    UpdateCommentUseCase,
    DeleteCommentUseCase,
    CreateOrUpdateLikeUseCase,
  ],
})
export class BloggersPlatformModule {}
