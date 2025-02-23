import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateSessionDto } from '../dto/create-session.dto';

@Schema({ timestamps: true })
export class Session {
  /**
   * The ID of the user associated with the session
   * @type {string}
   */
  @Prop({ type: String, require: true })
  userId: string;

  /**
   * Unique identifier of the device from which the session was created
   * @type {string}
   */
  @Prop({ type: String, require: true })
  deviceId: string;

  /**
   * User agent of the device from which the session was created
   * @type {string}
   */
  @Prop({ type: String, default: null })
  userAgent: string | null;

  /**
   * IP address of the device from which the session was created
   * @type {string}
   */
  @Prop({ type: String, default: null })
  ip: string | null;

  /**
   * The time the session was created
   * @type {number}
   */
  @Prop({ type: Number, require: true })
  iat: number;

  /**
   * The expiration time of the session
   * @type {number}
   */
  @Prop({ type: Number, require: true })
  exp: number;

  /**
   * Deletion timestamp, nullable, if date exist, means entity soft deleted
   * @type {Date | null}
   */
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   * properties without @Prop for typescript so that they are in the class instance (or in instance methods)
   * @type {Date}
   */
  createdAt: Date;
  updatedAt: Date;

  /**
   * Virtual property to get the stringified ObjectId
   * @returns {string} The string representation of the ID
   */
  get id(): string {
    // @ts-ignore
    return this._id.toString();
  }

  static createInstance(dto: CreateSessionDto): SessionDocument {
    const session = new this();
    session.userId = dto.userId;
    session.deviceId = dto.deviceId;
    session.userAgent = dto.userAgent || null;
    session.ip = dto.ip || null;
    session.iat = dto.iat;
    session.exp = dto.exp;
    return session as SessionDocument;
  }

  /**
   * Marks the user as deleted
   * Throws an error if already deleted
   * @throws {Error} If the entity is already deleted
   */
  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted'); // TODO: replase with domain exception
    }
    this.deletedAt = new Date();
  }
}

export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.loadClass(Session);

export type SessionDocument = HydratedDocument<Session>;
export type SessionModelType = Model<SessionDocument> & typeof Session;
