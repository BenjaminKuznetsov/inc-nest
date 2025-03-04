import { DeletionStatus, User, UserDocument, UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { UserViewDto } from '../api/view-dto/user.view-dto';
import { GetUsersQueryParams } from '../api/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { MeViewDto } from '../api/view-dto/me.view-dto';

export class UsersQueryRepo {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const user = await this.UserModel.findOne({
      _id: id,
      deletionStatus: DeletionStatus.NotDeleted,
    }).exec();

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return UserViewDto.mapToView(user);
  }

  async getAll(query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto>> {
    const filter: FilterQuery<User> = {
      deletionStatus: DeletionStatus.NotDeleted,
    };

    if (query.searchLoginTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        login: { $regex: query.searchLoginTerm, $options: 'i' },
      });
    }

    if (query.searchEmailTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        email: { $regex: query.searchEmailTerm, $options: 'i' },
      });
    }

    const result: UserDocument[] = await this.UserModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.UserModel.countDocuments(filter);

    return PaginatedViewDto.mapToView({
      items: result.map((user: UserDocument) => UserViewDto.mapToView(user)),
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount,
    });
  }

  async getMe(id: string): Promise<MeViewDto> {
    const user = await this.UserModel.findById(id);
    return MeViewDto.mapToView(user!);
  }
}
