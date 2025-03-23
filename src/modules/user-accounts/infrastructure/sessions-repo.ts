import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument, SessionModelType } from '../domain/session.entity';

@Injectable()
export class SessionsRepo {
  constructor(@InjectModel(Session.name) private SessionModel: SessionModelType) {}

  async save(session: SessionDocument) {
    await session.save();
  }

  async getSession(userId: string, deviceId: string, iat: number): Promise<SessionDocument | null> {
    return this.SessionModel.findOne({
      userId: userId,
      deviceId: deviceId,
      iat: iat,
      deletedAt: null,
    });
  }

  async getSessionsByUserId(userId: string): Promise<SessionDocument[]> {
    return this.SessionModel.find({ userId: userId, deletedAt: null }).sort({ iat: -1 });
  }

  async getSessionsByDeviceId(deviceId: string): Promise<SessionDocument[]> {
    return this.SessionModel.find({ deviceId: deviceId, deletedAt: null });
  }
}
