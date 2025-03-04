import { ValidateString } from '../../../../core/decorators/custom';

export class RegistrationConfirmationInputDto {
  @ValidateString()
  code: string;
}
