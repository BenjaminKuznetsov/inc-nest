import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { paths } from '../../src/common/paths';
import { mockUsers } from '../helpers/mock-data';
import { CreateUserInputDto } from '../../src/modules/user-accounts/api/input-dto/users.input-dto';
import { encodeToBase64 } from '../../src/core/utils/base-64';
import { CoreConfig } from '../../src/core/core.config';

describe('users', () => {
  let app: INestApplication<App>;
  let httpServer: App;
  let config: CoreConfig;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    config = moduleRef.get(CoreConfig);

    app = moduleRef.createNestApplication();
    appSetup(app);
    await app.init();
    httpServer = app.getHttpServer();

    await request(httpServer).delete(paths.testing).expect(HttpStatus.NO_CONTENT);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await request(httpServer).delete(paths.testing).expect(HttpStatus.NO_CONTENT);
  });

  it("shouldn't accept unauthenticated requests", async () => {
    await request(httpServer).post(paths.users).send(mockUsers[0]).expect(HttpStatus.UNAUTHORIZED);

    await request(httpServer)
      .post(paths.users)
      .set('Authorization', `Basic qwerty:qwerty`)
      .send(mockUsers[0])
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it("shouldn't create user without authorization with empty dto", async () => {
    await request(httpServer).post(paths.users).send({}).expect(HttpStatus.UNAUTHORIZED);
  });

  it("shouldn't create user with incorrect input data", async () => {
    const data1: CreateUserInputDto = {
      email: 'user1_user1.com',
      login: 'us@sfsf+',
      password: 'user1dhgfhdhgfhfgdhgfdhfgd',
    };

    const data2 = {
      email: 'user1@user1.com',
      login: 'user1',
    };

    const res1 = await request(httpServer)
      .post(paths.users)
      .set('Authorization', `Basic ${encodeToBase64(config.adminAuth)}`)
      .send(data1)
      .expect(HttpStatus.BAD_REQUEST);

    const res2 = await request(httpServer)
      .post(paths.users)
      .set('Authorization', `Basic ${encodeToBase64(config.adminAuth)}`)
      .send(data2)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res1.body).toEqual({
      errorsMessages: expect.arrayContaining([
        { field: 'login', message: expect.any(String) },
        { field: 'password', message: expect.any(String) },
        { field: 'email', message: expect.any(String) },
      ]),
    });

    expect(res2.body).toEqual({
      errorsMessages: expect.arrayContaining([{ field: 'password', message: expect.any(String) }]),
    });
  });

  it('should create user and shouldn`t create user with not unique login or email', async () => {
    const data: CreateUserInputDto = {
      email: 'user1@user1.com',
      login: 'user1',
      password: 'user1user1',
    };

    const res = await request(httpServer)
      .post(paths.users)
      .set('Authorization', `Basic ${encodeToBase64(config.adminAuth)}`)
      .send(data)
      .expect(HttpStatus.CREATED);

    expect(res.body).toEqual({
      id: expect.any(String),
      email: data.email,
      login: data.login,
      createdAt: expect.any(String),
    });

    const repeatLoginUser: CreateUserInputDto = {
      email: 'user111@user1.com',
      login: 'user1',
      password: 'user1user1',
    };

    const repeatEmailUser: CreateUserInputDto = {
      email: 'user1@user1.com',
      login: 'user111',
      password: 'user1user1',
    };

    const res1 = await request(httpServer)
      .post(paths.users)
      .set('Authorization', `Basic ${encodeToBase64(config.adminAuth)}`)
      .send(repeatLoginUser)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res1.body).toEqual({
      errorsMessages: [
        {
          field: 'login',
          message: expect.any(String),
        },
      ],
    });

    const res2 = await request(httpServer)
      .post(paths.users)
      .set('Authorization', `Basic ${encodeToBase64(config.adminAuth)}`)
      .send(repeatEmailUser)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res2.body).toEqual({
      errorsMessages: [
        {
          field: 'email',
          message: expect.any(String),
        },
      ],
    });
  });

  it('should return users with paging and sorting', async () => {
    for (const user of mockUsers) {
      const res = await request(httpServer)
        .post(paths.users)
        .set('Authorization', `Basic ${encodeToBase64(config.adminAuth)}`)
        .send(user)
        .expect(HttpStatus.CREATED);
      // console.log("res", res.body)
    }

    const response = await request(httpServer)
      .get(paths.users)
      .set('Authorization', `Basic ${encodeToBase64(config.adminAuth)}`)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 5,
      items: [
        {
          id: expect.any(String),
          login: 'AlexWiams',
          email: 'alex@alex.com',
          createdAt: expect.any(String),
        },
        {
          id: expect.any(String),
          login: 'BobBrown',
          email: 'bob@bob.com',
          createdAt: expect.any(String),
        },
        {
          id: expect.any(String),
          login: 'AnnJohnson',
          email: 'ann@ann.com',
          createdAt: expect.any(String),
        },
        {
          id: expect.any(String),
          login: 'DaveSmith',
          email: 'dave@dave.com',
          createdAt: expect.any(String),
        },
        {
          id: expect.any(String),
          login: 'JohnDoe',
          email: 'johnan@john.com',
          createdAt: expect.any(String),
        },
      ],
    });

    const response2 = await request(httpServer)
      .get(paths.users + '?searchLoginTerm=s&sortBy=login')
      .set('Authorization', `Basic ${encodeToBase64(config.adminAuth)}`)
      .expect(HttpStatus.OK);

    expect(response2.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 3,
      items: [
        {
          id: expect.any(String),
          login: 'DaveSmith',
          email: 'dave@dave.com',
          createdAt: expect.any(String),
        },
        {
          id: expect.any(String),
          login: 'AnnJohnson',
          email: 'ann@ann.com',
          createdAt: expect.any(String),
        },
        {
          id: expect.any(String),
          login: 'AlexWiams',
          email: 'alex@alex.com',
          createdAt: expect.any(String),
        },
      ],
    });

    const response3 = await request(httpServer)
      .get(paths.users + '?searchEmailTerm=an&sortBy=login&sortDirection=asc')
      .set('Authorization', `Basic ${encodeToBase64(config.adminAuth)}`)
      .expect(HttpStatus.OK);

    expect(response3.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      // items: expect.arrayContaining([
      //   {
      //     login: 'AnnJohnson',
      //     email: 'ann@ann.com',
      //     id: expect.any(String),
      //     createdAt: expect.any(String),
      //   },
      //   {
      //     id: expect.any(String),
      //     login: 'JohnDoe',
      //     email: 'johnan@john.com',
      //     createdAt: expect.any(String),
      //   },
      // ]),
      items: [
        {
          id: expect.any(String),
          login: 'AnnJohnson',
          email: 'ann@ann.com',
          createdAt: expect.any(String),
        },
        {
          id: expect.any(String),
          login: 'JohnDoe',
          email: 'johnan@john.com',
          createdAt: expect.any(String),
        },
      ],
    });
  });

  it("should delete  user with correct id and shouldn't delete user with non-existent id", async () => {
    const ids = [];

    for (const user of mockUsers) {
      const res = await request(httpServer)
        .post(paths.users)
        .set('Authorization', `Basic ${encodeToBase64(config.adminAuth)}`)
        .send(user)
        .expect(HttpStatus.CREATED);

      // @ts-ignore
      ids.push(res.body.id);
    }

    const response = await request(httpServer)
      .delete(paths.users + '/' + ids[0])
      .set('Authorization', `Basic ${encodeToBase64(config.adminAuth)}`)
      .expect(HttpStatus.NO_CONTENT);

    const response1 = await request(httpServer)
      .get(paths.users)
      .set('Authorization', `Basic ${encodeToBase64(config.adminAuth)}`)
      .expect(HttpStatus.OK);

    expect(response1.body.totalCount).toBe(4);

    const response2 = await request(httpServer)
      .delete(paths.users + '/111')
      .set('Authorization', `Basic ${encodeToBase64(config.adminAuth)}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
