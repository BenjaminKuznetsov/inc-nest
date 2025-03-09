import { NotFoundException } from '@nestjs/common';
import { BlogsRepo } from '../../infra/blogs.repo';
import { BlogInputDto } from '../../dto/blog-input.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public dto: BlogInputDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogsRepo: BlogsRepo) {}

  async execute({ id, dto }: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepo.findById(id);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    blog.update(dto);
    await this.blogsRepo.save(blog);
  }
}
