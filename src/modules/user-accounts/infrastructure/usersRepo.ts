import { InjectModel } from '@nestjs/mongoose';
import { DeletionStatus, User, UserDocument, UserModelType } from '../domain/user.entity';
import { NotFoundException } from '@nestjs/common';

export class UsersRepo {
  //инжектирование модели через DI
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }

  async save(user: UserDocument) {
    await user.save();
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
      foundUser = await this.UserModel.findOne({ email: loginOrEmail });
    } else {
      foundUser = await this.UserModel.findOne({ login: loginOrEmail });
    }
    return foundUser as UserDocument | null;
  }
}
