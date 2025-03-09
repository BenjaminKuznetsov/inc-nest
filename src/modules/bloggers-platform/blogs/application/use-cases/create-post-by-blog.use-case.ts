import { BlogPostInputDto } from '../../dto/post-input.dto';
import { PostInputDto } from '../../../posts/dto/post-input.dto';
import { BlogsService } from '../blogs.service';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostCommand } from '../../../posts/application/use-cases/create-post.use-case';

export class CreatePostByBlogCommand {
  constructor(
    public blogId: string,
    public dto: BlogPostInputDto,
  ) {}
}

@CommandHandler(CreatePostByBlogCommand)
export class CreatePostByBlogUseCase implements ICommandHandler<CreatePostByBlogCommand> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly blogsService: BlogsService,
  ) {}

  async execute({ blogId, dto }: CreatePostByBlogCommand): Promise<string> {
    const blog = await this.blogsService.findByIdOrThrowNotFound(blogId);
    const createPostDto: PostInputDto = { ...dto, blogId: blog.id };
    return this.commandBus.execute(new CreatePostCommand(createPostDto));
  }
}
