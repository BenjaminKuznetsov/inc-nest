import { NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../domain/post.entity';
import { BlogsRepo } from '../../../blogs/infra/blogs.repo';
import { PostsRepo } from '../../infra/post.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeletePostCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    @InjectModel(Post.name) private readonly PostModel: PostModelType,
    private readonly postsRepo: PostsRepo,
    private readonly blogsRepo: BlogsRepo,
  ) {}

  async execute({ id }: DeletePostCommand): Promise<void> {
    const post = await this.postsRepo.findById(id);
    if (!post) {
      throw new NotFoundException('Blog not found');
    }
    post.makeDeleted();
    await this.postsRepo.save(post);
  }
}
