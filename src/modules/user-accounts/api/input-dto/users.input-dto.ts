import { CreateUserDto } from '../../dto/create-user.dto';
import { ValidateString } from '../../../../core/decorators/custom';
import { userConstraints } from '../../domain/user.constraints';

export class CreateUserInputDto implements CreateUserDto {
  @ValidateString({
    min: userConstraints.login.minLength,
    max: userConstraints.login.maxLength,
    regex: userConstraints.login.regex,
  })
  login: string;

  @ValidateString({ min: userConstraints.passwordLength.minLength, max: userConstraints.passwordLength.maxLength })
  password: string;

  @ValidateString({ regex: userConstraints.emailLength.regex })
  email: string;
}
