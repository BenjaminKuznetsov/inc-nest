import { ValidateString } from '../../../../core/decorators/custom';

export class LoginInputDto {
  @ValidateString()
  loginOrEmail: string;

  @ValidateString()
  password: string;
}
