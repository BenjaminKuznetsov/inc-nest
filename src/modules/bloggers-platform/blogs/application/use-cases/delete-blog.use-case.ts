import { NotFoundException } from '@nestjs/common';
import { BlogsRepo } from '../../infra/blogs.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private readonly blogsRepo: BlogsRepo) {}

  async execute({ id }: DeleteBlogCommand): Promise<void> {
    const blog = await this.blogsRepo.findById(id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    blog.makeDeleted();
    await this.blogsRepo.save(blog);
  }
}
