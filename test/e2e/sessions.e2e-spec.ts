import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import { paths } from '../../src/core/paths';
import { DevicesViewDto } from '../../src/modules/user-accounts/api/view-dto/devices.view-dto';
import { JwtService } from '../../src/modules/user-accounts/application/jwt.service';
import { EmailService } from '../../src/modules/notifications/email.service';
import { EmailServiceMock } from '../mocks/email-service.mock';
import { UserAccountsConfig } from '../../src/modules/user-accounts/config/user-accounts.config';

const mockUsers = [
  {
    login: 'JohnDoe',
    email: 'johnan@john.com',
    password: 'johnjohn',
  },
  {
    login: 'DaveSmith',
    email: 'dave@dave.com',
    password: 'davedave',
  },
];

const userAgents = [
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile' +
    ' Safari/537.36',
  'Mozilla/5.0 (iPhone14,6; U; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko)' +
    ' Version/10.0 Mobile/19E241 Safari/602.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246',
];

type AccessData = {
  accessToken: string;
  refreshTokenCookie: string;
  deviceId: string;
};

describe('sessions', () => {
  let app: INestApplication<App>;
  let httpServer: App;
  let jwtService: JwtService;
  let config: UserAccountsConfig;

  const firstUserDevices: AccessData[] = [];
  let devices1: DevicesViewDto[];

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useClass(EmailServiceMock)
      .compile();

    jwtService = moduleRef.get(JwtService);
    config = moduleRef.get(UserAccountsConfig);

    app = moduleRef.createNestApplication();
    appSetup(app);
    await app.init();
    httpServer = app.getHttpServer();

    await request(httpServer).delete(paths.testing).expect(HttpStatus.NO_CONTENT);
  });

  afterAll(async () => {
    await app.close();
  });

  const getTokenFromCookie = (cookie: string) => {
    return cookie.split(';')[0].replace(config.refreshTokenCookieName + '=', '');
  };

  it('should register 2 users', async () => {
    await request(httpServer).post(paths.auth.register).send(mockUsers[0]).expect(HttpStatus.NO_CONTENT);

    await request(httpServer).post(paths.auth.register).send(mockUsers[1]).expect(HttpStatus.NO_CONTENT);
  });

  it('should login first user 4 times', async () => {
    for (const userAgent of userAgents) {
      const res = await request(httpServer)
        .post(paths.auth.login)
        .send({ loginOrEmail: mockUsers[0].login, password: mockUsers[0].password })
        .set('User-Agent', userAgent)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({ accessToken: expect.any(String) });

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.length).toBeGreaterThan(0);
      const refreshToken = getTokenFromCookie(cookies[0]);
      // console.log('refreshToken', refreshToken);
      const payload = await jwtService.decodeRefreshToken(refreshToken);
      // console.log('payload', payload);

      firstUserDevices.push({
        accessToken: res.body.accessToken,
        refreshTokenCookie: cookies[0],
        deviceId: payload.deviceId,
      });
    }
    // console.log('firstUserDevices', firstUserDevices);
  });

  // it.skip("should login second user", async () => {
  //     const res = await request(httpServer)
  //         .post(paths.auth.login)
  //         .send({ loginOrEmail: mockUsers[1].login, password: mockUsers[1].password })
  //         .expect(HttpStatus.OK)
  //
  //     expect(res.body).toEqual({ accessToken: expect.any(String) })
  //
  //     const cookies = res.headers["set-cookie"]
  //     expect(cookies).toBeDefined()
  //     expect(cookies.length).toBeGreaterThan(0)
  //     const refreshToken = getTokenFromCookie(cookies[0])
  //     const payload = await jwtService.decodeToken(refreshToken) as JwtPayload
  //
  //     const secondUserAccess = {
  //         accessToken: res.body.accessToken,
  //         refreshTokenCookie: cookies[0],
  //         deviceId: payload.deviceId,
  //     }
  // })

  it('should get active sessions', async () => {
    //createAndLoginUsers(2)
    //loginUser(1, 'mozila')
    //loginUser(1, 'chrom')
    const res = await request(httpServer)
      .get(paths.sessions)
      .set('Cookie', firstUserDevices[0].refreshTokenCookie)
      .expect(HttpStatus.OK);

    expect(res.body).toHaveLength(4);
    res.body.forEach((item: DevicesViewDto) => {
      expect(item).toMatchObject({
        ip: expect.any(String),
        title: expect.any(String),
        lastActiveDate: expect.any(String),
        deviceId: expect.any(String),
      });
    });

    devices1 = res.body;
    // console.log("devices1", devices1)
  });

  it('should update refresh token for device 1', async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const res = await request(httpServer)
      .post(paths.auth.refresh)
      .set('Cookie', firstUserDevices[0].refreshTokenCookie)
      .expect(HttpStatus.OK);

    expect(res.body).toEqual({ accessToken: expect.any(String) });
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.length).toBeGreaterThan(0);

    const newAccessToken = res.body.accessToken;
    const newRefreshTokenCookie = cookies[0];

    const { deviceId } = await jwtService.decodeRefreshToken(getTokenFromCookie(newRefreshTokenCookie));
    expect(deviceId).toBe(firstUserDevices[0].deviceId);

    // try to refresh with old refresh token, should return 401
    await request(httpServer)
      .post(paths.auth.refresh)
      .set('Cookie', firstUserDevices[0].refreshTokenCookie)
      .expect(HttpStatus.UNAUTHORIZED);

    firstUserDevices[0].accessToken = newAccessToken;
    firstUserDevices[0].refreshTokenCookie = newRefreshTokenCookie;
  });

  it('should get active sessions again', async () => {
    const res = await request(httpServer)
      .get(paths.sessions)
      .set('Cookie', firstUserDevices[0].refreshTokenCookie)
      .expect(HttpStatus.OK);

    expect(res.body).toHaveLength(4);

    const devices2 = res.body as DevicesViewDto[];

    const dev_1_1 = devices1.find((device) => device.deviceId === firstUserDevices[0].deviceId) as DevicesViewDto;
    const dev_1_2 = devices2.find((device) => device.deviceId === firstUserDevices[0].deviceId) as DevicesViewDto;

    expect(dev_1_1).toBeDefined();
    expect(dev_1_2).toBeDefined();
    expect(dev_1_1.ip).toBe(dev_1_2.ip);
    expect(dev_1_1.title).toBe(dev_1_2.title);
    expect(dev_1_1.lastActiveDate).not.toBe(dev_1_2.lastActiveDate);

    const dev_2_1 = devices1.find((device) => device.deviceId === firstUserDevices[1].deviceId) as DevicesViewDto;
    const dev_2_2 = devices2.find((device) => device.deviceId === firstUserDevices[1].deviceId) as DevicesViewDto;

    expect(dev_2_1).toBeDefined();
    expect(dev_2_2).toBeDefined();
    expect(dev_2_1.ip).toBe(dev_2_2.ip);
    expect(dev_2_1.title).toBe(dev_2_2.title);
    expect(dev_2_1.lastActiveDate).toBe(dev_2_2.lastActiveDate);

    const dev_3_1 = devices1.find((device) => device.deviceId === firstUserDevices[2].deviceId) as DevicesViewDto;
    const dev_3_2 = devices2.find((device) => device.deviceId === firstUserDevices[2].deviceId) as DevicesViewDto;

    expect(dev_3_1).toBeDefined();
    expect(dev_3_2).toBeDefined();
    expect(dev_3_1.ip).toBe(dev_3_2.ip);
    expect(dev_3_1.title).toBe(dev_3_2.title);
    expect(dev_3_1.lastActiveDate).toBe(dev_3_2.lastActiveDate);

    const dev_4_1 = devices1.find((device) => device.deviceId === firstUserDevices[3].deviceId) as DevicesViewDto;
    const dev_4_2 = devices2.find((device) => device.deviceId === firstUserDevices[3].deviceId) as DevicesViewDto;

    expect(dev_4_1).toBeDefined();
    expect(dev_4_2).toBeDefined();
    expect(dev_4_1.ip).toBe(dev_4_2.ip);
    expect(dev_4_1.title).toBe(dev_4_2.title);
    expect(dev_4_1.lastActiveDate).toBe(dev_4_2.lastActiveDate);
  });

  it('should terminate session on device 2 sending request from device 1', async () => {
    await request(httpServer)
      .delete(`${paths.sessions}/${firstUserDevices[1].deviceId}`)
      .set('Cookie', firstUserDevices[0].refreshTokenCookie)
      .expect(HttpStatus.NO_CONTENT);

    const res = await request(httpServer)
      .get(paths.sessions)
      .set('Cookie', firstUserDevices[0].refreshTokenCookie)
      .expect(HttpStatus.OK);

    expect(res.body).toHaveLength(3);
    const devices3 = res.body as DevicesViewDto[];
    const device2 = devices3.find((device) => device.deviceId === firstUserDevices[1].deviceId);
    expect(device2).toBeUndefined();
  });

  it('should logout device 3', async () => {
    await request(httpServer)
      .post(paths.auth.logout)
      .set('Cookie', firstUserDevices[2].refreshTokenCookie)
      .expect(HttpStatus.NO_CONTENT);

    const res = await request(httpServer)
      .get(paths.sessions)
      .set('Cookie', firstUserDevices[0].refreshTokenCookie)
      .expect(HttpStatus.OK);

    expect(res.body).toHaveLength(2);
    const devices4 = res.body as DevicesViewDto[];
    const device3 = devices4.find((device) => device.deviceId === firstUserDevices[2].deviceId);
    expect(device3).toBeUndefined();
  });

  it('should terminate all other user sessions', async () => {
    await request(httpServer)
      .delete(paths.sessions)
      .set('Cookie', firstUserDevices[0].refreshTokenCookie)
      .expect(HttpStatus.NO_CONTENT);

    const res = await request(httpServer)
      .get(paths.sessions)
      .set('Cookie', firstUserDevices[0].refreshTokenCookie)
      .expect(HttpStatus.OK);

    expect(res.body).toHaveLength(1);
    const devices5 = res.body as DevicesViewDto[];
    const device4 = devices5.find((device) => device.deviceId === firstUserDevices[3].deviceId);
    expect(device4).toBeUndefined();
  });
});
