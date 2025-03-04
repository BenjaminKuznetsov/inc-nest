import { ValidateString } from '../../../../core/decorators/custom';

export class BlogInputDto {
  // TODO: move to constraints
  @ValidateString({ min: 3, max: 15 })
  name: string;
  @ValidateString({ min: 3, max: 500 })
  description: string;
  @ValidateString({ max: 100 })
  websiteUrl: string;
}
