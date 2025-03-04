import { UserDocument } from '../../domain/user.entity';

export class MeViewDto {
  userId: string;
  login: string;
  email: string;

  static mapToView(user: UserDocument): MeViewDto {
    const dto = new MeViewDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.userId = user._id.toString();

    return dto;
  }
}
