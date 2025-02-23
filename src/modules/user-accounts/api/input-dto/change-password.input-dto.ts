import { ValidateString } from '../../../../core/decorators/custom';
import { userConstraints } from '../../domain/user.constraints';

export class ChangePasswordInputDto {
  @ValidateString({ min: userConstraints.passwordLength.minLength, max: userConstraints.passwordLength.maxLength })
  newPassword: string;

  @ValidateString()
  recoveryCode: string;
}
