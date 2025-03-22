import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument, SessionModelType } from '../domain/session.entity';
import { RefreshTokenPayload } from '../dto/token-payload';

@Injectable()
export class SessionsRepo {
  constructor(@InjectModel(Session.name) private SessionModel: SessionModelType) {}

  async save(session: SessionDocument) {
    await session.save();
  }

  async getSessionByTokenPayload(data: RefreshTokenPayload): Promise<SessionDocument | null> {
    return this.SessionModel.findOne({
      userId: data.userId,
      deviceId: data.deviceId,
      iat: data.iat,
      exp: data.exp,
      deletedAt: null,
    });
  }

  async getSessionsByUserId(userId: string): Promise<SessionDocument[]> {
    return this.SessionModel.find({ user_id: userId }).sort({ iat: -1 });
  }
}
