import { ValidateString } from '../../../../core/decorators/custom';

export class BlogPostInputDto {
  // TODO: move to constraints
  @ValidateString({ min: 3, max: 30 })
  title: string;
  @ValidateString({ min: 3, max: 100 })
  shortDescription: string;
  @ValidateString({ min: 3, max: 1000 })
  content: string;
}
