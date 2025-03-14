import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../domain/post.entity';
import { PostInputDto } from '../../dto/post-input.dto';
import { BlogsRepo } from '../../../blogs/infra/blogs.repo';
import { PostsRepo } from '../../infra/post.repo';
import { CustomBadRequestException } from '../../../../../core/exception/bad-request';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreatePostCommand {
  constructor(public dto: PostInputDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand, string> {
  constructor(
    @InjectModel(Post.name) private readonly PostModel: PostModelType,
    private readonly postsRepo: PostsRepo,
    private readonly blogsRepo: BlogsRepo,
  ) {}

  async execute({ dto }: CreatePostCommand): Promise<string> {
    const blog = await this.blogsRepo.findById(dto.blogId);
    if (!blog) {
      throw new CustomBadRequestException({ field: 'blogId', message: 'Blog not found' });
    }
    const post = this.PostModel.createInstance(dto, blog);
    await this.postsRepo.save(post);
    return post.id;
  }
}
