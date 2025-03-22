import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DevicesViewDto } from '../../api/view-dto/devices.view-dto';
import { SessionsRepo } from '../../infrastructure/sessions-repo';
import useragent from 'express-useragent';

export class GetUserSessionsQuery {
  constructor(public userId: string) {}
}

@QueryHandler(GetUserSessionsQuery)
export class GetUserSessionsQueryHandler implements IQueryHandler<GetUserSessionsQuery, DevicesViewDto[]> {
  constructor(private readonly sessionsRepo: SessionsRepo) {}

  async execute({ userId }: GetUserSessionsQuery): Promise<DevicesViewDto[]> {
    const devices = await this.sessionsRepo.getSessionsByUserId(userId);

    return devices.map((device) => {
      const parsedUserAgent = useragent.parse(device.userAgent || '');

      return {
        ip: device.ip || 'unknown',
        title: `${parsedUserAgent.browser} ${parsedUserAgent.version}`,
        lastActiveDate: new Date(device.iat).toISOString(),
        deviceId: device.deviceId,
      };
    });
  }
}
