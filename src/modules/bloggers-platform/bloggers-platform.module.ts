import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/api/blogs.controller/blogs.controller';
import { BlogsService } from './blogs/application/blogs/blogs.service';
import { BlogsRepo } from './blogs/infra/blogs.repo';
import { BlogsQueryRepo } from './blogs/infra/blogs.query-repo';
import { PostsController } from './posts/api/posts.controller';
import { PostsService } from './posts/application/posts.service';
import { PostsRepo } from './posts/infra/post.repo';
import { PostsQueryRepo } from './posts/infra/post.query-repo';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { Post, PostSchema } from './posts/domain/post.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  controllers: [BlogsController, PostsController],
  providers: [
    BlogsService,
    BlogsRepo,
    BlogsQueryRepo,
    PostsService,
    PostsRepo,
    PostsQueryRepo,
  ],
})
export class BloggersPlatformModule {}
