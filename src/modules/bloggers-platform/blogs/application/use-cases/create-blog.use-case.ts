import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../domain/blog.entity';
import { CreateBlogDto } from '../../dto/create-blog.dto';
import { BlogsRepo } from '../../infra/blogs.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand, string> {
  constructor(
    @InjectModel(Blog.name) private readonly BlogModel: BlogModelType,
    private readonly blogsRepo: BlogsRepo,
  ) {}

  async execute({ dto }: CreateBlogCommand): Promise<string> {
    const blog = this.BlogModel.createInstance(dto);
    await this.blogsRepo.save(blog);
    return blog.id;
  }
}
