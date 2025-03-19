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

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    config = moduleRef.get<CoreConfig>(CoreConfig);

    app = moduleRef.createNestApplication();
    appSetup(app);
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('like for post', () => {
    let post: PostViewDto;
    let user1: LoginedUser, user2: LoginedUser, user3: LoginedUser, user4: LoginedUser;
    beforeAll(async () => {
      await request(httpServer).delete(paths.testing).expect(HttpStatus.NO_CONTENT);

      const posts = await e2eSeeder.posts(httpServer, 1, config);
      post = posts[0];
      user1 = await e2eSeeder.createAndLoginUser(httpServer, config, 0);
      user2 = await e2eSeeder.createAndLoginUser(httpServer, config, 1);
      user3 = await e2eSeeder.createAndLoginUser(httpServer, config, 2);
      user4 = await e2eSeeder.createAndLoginUser(httpServer, config, 3);
    });

    it('should like for post', async () => {
      const likeBody: LikeInputDTO = { likeStatus: LikeStatus.Like };
      const dislikeBody: LikeInputDTO = { likeStatus: LikeStatus.Dislike };

      // like by user1
      await request(httpServer)
        .put(`${paths.posts}/${post.id}/like-status`)
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .send(likeBody)
        .expect(HttpStatus.NO_CONTENT);

      // like by user2
      await request(httpServer)
        .put(`${paths.posts}/${post.id}/like-status`)
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .send(likeBody)
        .expect(HttpStatus.NO_CONTENT);

      // like by user3
      await request(httpServer)
        .put(`${paths.posts}/${post.id}/like-status`)
        .set('Authorization', `Bearer ${user3.accessToken}`)
        .send(likeBody)
        .expect(HttpStatus.NO_CONTENT);

      // dislike by user4
      await request(httpServer)
        .put(`${paths.posts}/${post.id}/like-status`)
        .set('Authorization', `Bearer ${user4.accessToken}`)
        .send(dislikeBody)
        .expect(HttpStatus.NO_CONTENT);

      // Get post by user1
      const response = await request(httpServer)
        .get(`${paths.posts}/${post.id}`)
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .expect(HttpStatus.OK);

      const likesInfo = response.body.extendedLikesInfo;

      expect(likesInfo).toEqual({
        likesCount: 3,
        dislikesCount: 1,
        myStatus: LikeStatus.Like,
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: user3.id,
            login: user3.login,
          },
          {
            addedAt: expect.any(String),
            userId: user2.id,
            login: user2.login,
          },
          {
            addedAt: expect.any(String),
            userId: user1.id,
            login: user1.login,
          },
        ],
      });
    });
  });
});
