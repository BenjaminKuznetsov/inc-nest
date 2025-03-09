import { NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../domain/post.entity';
import { PostInputDto } from '../../dto/post-input.dto';
import { BlogsRepo } from '../../../blogs/infra/blogs.repo';
import { PostsRepo } from '../../infra/post.repo';
import { CustomBadRequestException } from '../../../../../common/exception/bad-request';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdatePostCommand {
  constructor(
    public id: string,
    public dto: PostInputDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    @InjectModel(Post.name) private readonly PostModel: PostModelType,
    private readonly postsRepo: PostsRepo,
    private readonly blogsRepo: BlogsRepo,
  ) {}

  async execute({ id, dto }: UpdatePostCommand): Promise<void> {
    const blog = await this.blogsRepo.findById(dto.blogId);
    if (!blog) {
      throw new CustomBadRequestException({ field: 'blogId', message: 'Blog not found' });
    }
    const post = await this.postsRepo.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    post.update(dto);
    await this.postsRepo.save(post);
  }
}
