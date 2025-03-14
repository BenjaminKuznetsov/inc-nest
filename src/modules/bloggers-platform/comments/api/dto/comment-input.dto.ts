import { ValidateString } from '../../../../../core/decorators/custom';

export class CommentInputDto {
  @ValidateString({ min: 20, max: 300 })
  content: string;
}
