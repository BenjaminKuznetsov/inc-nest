import { InjectModel } from '@nestjs/mongoose';
import { ConfirmationStatus, DeletionStatus, User, UserDocument, UserModelType } from '../domain/user.entity';
import { NotFoundException } from '@nestjs/common';

type UserDBFilter = {
  login?: string;
  email?: string;
};

export class UsersRepo {
  //инжектирование модели через DI
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async save(user: UserDocument) {
    await user.save();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      //TODO: replace with domain exception
      throw new NotFoundException('user not found');
    }

    return user;
  }

  async getByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    let foundUser: UserDocument | null;
    if (loginOrEmail.includes('@')) {
      foundUser = await this.UserModel.findOne({
        email: loginOrEmail,
        deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
      });
    } else {
      foundUser = await this.UserModel.findOne({
        login: loginOrEmail,
        deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
      });
    }
    return foundUser as UserDocument | null;
  }

  async getUserByConfirmationCode(code: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }

  async getUserByRecoveryCode(code: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'passwordRecovery.recoveryCode': code,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }

  async setUserAsConfirmed(userId: string): Promise<boolean> {
    const result = await this.UserModel.updateOne(
      { _id: userId },
      { $set: { 'emailConfirmation.confirmationStatus': ConfirmationStatus.CONFIRMED } },
    );
    return !!result.modifiedCount;
  }

  async getUserByFilter(filter: UserDBFilter): Promise<UserDocument | null> {
    const query: Record<string, unknown> = { deletionStatus: { $ne: DeletionStatus.PermanentDeleted } };
    if (filter.login) {
      query.login = { $regex: filter.login, $options: 'i' };
    }
    if (filter.email) {
      query.email = { $regex: filter.email, $options: 'i' };
    }
    return this.UserModel.findOne(query);
  }
}
