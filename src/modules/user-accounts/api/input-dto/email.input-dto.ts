import { ValidateString } from '../../../../core/decorators/custom';
import { userConstraints } from '../../domain/user.constraints';

export class EmailInputDto {
  @ValidateString({ regex: userConstraints.emailLength.regex })
  email: string;
}
