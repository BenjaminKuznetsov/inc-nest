import request from 'supertest';
import { e2eSeeder, LoginedUser } from '../helpers/seeders';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { CoreConfig } from '../../src/core/core.config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import { PostViewDto } from '../../src/modules/bloggers-platform/posts/dto/post-view.dto';
import { paths } from '../../src/core/paths';
import { LikeInputDTO } from '../../src/modules/bloggers-platform/likes/dto/like.input-dto';
import { LikeStatus } from '../../src/modules/bloggers-platform/likes/domain/like.entity';

describe('likes', () => {
  let app: INestApplication<App>;
  let httpServer: App;
  let config: CoreConfig;

  let post: PostViewDto;
  let user1: LoginedUser;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    config = moduleRef.get<CoreConfig>(CoreConfig);

    app = moduleRef.createNestApplication();
    appSetup(app);
    await app.init();
    httpServer = app.getHttpServer();

    await request(httpServer).delete(paths.testing).expect(HttpStatus.NO_CONTENT);

    const posts = await e2eSeeder.posts(httpServer, 1, config);
    post = posts[0];

    user1 = await e2eSeeder.createAndLoginUser(httpServer, config);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('like for post', () => {
    it('should like for post', async () => {
      const body: LikeInputDTO = {
        likeStatus: LikeStatus.Like,
      };
      const response = await request(httpServer)
        .put(`${paths.posts}/${post.id}/like-status`)
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .send(body)
        .expect(HttpStatus.NO_CONTENT);
    });
  });
});
