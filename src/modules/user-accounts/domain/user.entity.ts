import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDto, CreateUserOptions } from '../dto/create-user.dto';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';

export enum DeletionStatus {
  NotDeleted = 'not-deleted',
  PermanentDeleted = 'permanent-deleted',
}

export enum ConfirmationStatus {
  CREATED_BY_ADMIN = 0,
  NOT_CONFIRMED = 1,
  CONFIRMED = 2,
}

@Schema({
  _id: false,
  timestamps: true,
})
class EmailConfirmation {
  @Prop({ type: String }) // not required if created by admin
  confirmationCode: string;

  @Prop({ type: Date }) // not required if created by admin
  expirationDate: Date;

  @Prop({ type: Number, enum: ConfirmationStatus, required: true })
  confirmationStatus: ConfirmationStatus;

  createdAt: Date;
  updatedAt: Date;
}

const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);

@Schema({
  _id: false,
  timestamps: true,
})
class PasswordRecovery {
  @Prop({ type: String, required: true })
  recoveryCode: string;

  @Prop({ type: Date, required: true })
  expirationDate: Date;
}

//флаг timestemp автоматичеки добавляет поля upatedAt и createdAt
@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: EmailConfirmationSchema, required: true })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: PasswordRecovery, default: null })
  passwordRecovery: PasswordRecovery | null;

  @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   * properties without @Prop for typescript so that they are in the class instance (or in instance methods)
   * @type {Date}
   */
  createdAt: Date;
  updatedAt: Date;

  static createInstance(dto: CreateUserDto, options: CreateUserOptions): UserDocument {
    //userDocument!
    const user = new this(); //UserModel!
    user.email = dto.email;
    user.passwordHash = dto.password;
    user.login = dto.login;

    const emailConfirmation = options.isCreatedByAdmin
      ? {
          confirmationStatus: ConfirmationStatus.CREATED_BY_ADMIN,
        }
      : {
          confirmationStatus: ConfirmationStatus.NOT_CONFIRMED,
          confirmationCode: randomUUID(),
          expirationDate: add(new Date(), {
            hours: 1,
            minutes: 30,
          }),
        };

    user.emailConfirmation = emailConfirmation as EmailConfirmation;

    return user as UserDocument;
  }

  makeDeleted() {
    if (this.deletionStatus !== DeletionStatus.NotDeleted) {
      throw new Error('Entity already deleted'); // TODO: replase with domain exception
    }
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;

export type UserModelType = Model<UserDocument> & typeof User;
