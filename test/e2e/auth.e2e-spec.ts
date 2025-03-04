import request from 'supertest';
import { CreatedUser, e2eSeeder } from '../helpers/seeders';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import { paths } from '../../src/common/paths';

describe('auth', () => {
  let app: INestApplication<App>;
  let httpServer: App;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('authentication', () => {
    let user: CreatedUser;

    beforeAll(async () => {
      await request(httpServer).delete(paths.testing).expect(HttpStatus.NO_CONTENT);
      const users = await e2eSeeder.users(httpServer, 1);
      user = users[0];
    });

    it('failed login with wrong login or email', async () => {
      await request(httpServer)
        .post(paths.auth.login)
        .send({ loginOrEmail: '123123', password: user.password })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('failed login with wrong password', async () => {
      await request(httpServer)
        .post(paths.auth.login)
        .send({ loginOrEmail: user.login, password: '123123' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('failed login without login or email', async () => {
      await request(httpServer).post(paths.auth.login).send({ password: user.password }).expect(HttpStatus.BAD_REQUEST);
    });

    it('failed login without password', async () => {
      await request(httpServer)
        .post(paths.auth.login)
        .send({ loginOrEmail: user.login })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('login user', async () => {
      const res1 = await request(httpServer)
        .post(paths.auth.login)
        .send({ loginOrEmail: user.login, password: user.password })
        .expect(HttpStatus.OK);

      console.log(res1.body);

      expect(res1.body).toEqual({
        accessToken: expect.any(String),
      });

      user.accessToken = res1.body.accessToken;
    });

    it('auth and get me', async () => {
      const res2 = await request(httpServer)
        .get(paths.auth.me)
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(HttpStatus.OK);

      expect(res2.body).toEqual({
        userId: user.id,
        email: user.email,
        login: user.login,
      });
    });

    it('failed auth with invalid token', async () => {
      await request(httpServer)
        .get(paths.auth.me)
        .set('Authorization', `Bearer ${user.accessToken}123`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('password recovery', () => {
    beforeAll(async () => {
      await request(httpServer).delete(paths.testing).expect(HttpStatus.NO_CONTENT);
    });

    it('POST -> "auth/password-recovery": should send email with recovery code; status 204 (not existent user)', async () => {
      request(httpServer)
        .post(paths.auth.passwordRecovery)
        .send({ email: 'example@example.com' })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('POST -> "auth/password-recovery": should send email with recovery code; status 204', async () => {
      const user = await e2eSeeder.createAndLoginUser(httpServer);

      request(httpServer).post(paths.auth.passwordRecovery).send({ email: user.email }).expect(HttpStatus.NO_CONTENT);
    });
  });
});
