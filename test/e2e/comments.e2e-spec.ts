import request from 'supertest';
import { e2eSeeder, LoginedUser } from '../helpers/seeders';
import { ObjectId } from 'mongodb';
import _ from 'lodash';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { CoreConfig } from '../../src/core/core.config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import { PostViewDto } from '../../src/modules/bloggers-platform/posts/dto/post-view.dto';
import { paths } from '../../src/core/paths';
import { CommentInputDto } from '../../src/modules/bloggers-platform/comments/api/dto/comment-input.dto';
import { getStringWithLength } from '../helpers/utils';
import { CommentViewDto } from '../../src/modules/bloggers-platform/comments/dto/comment-view.dto';

describe('comments', () => {
  let app: INestApplication<App>;
  let httpServer: App;
  let config: CoreConfig;

  let posts: PostViewDto[];
  let user1: LoginedUser;
  let user2: LoginedUser;

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

    posts = await e2eSeeder.posts(httpServer, 4, config);

    user1 = await e2eSeeder.createAndLoginUser(httpServer, config);
    user2 = await e2eSeeder.createAndLoginUser(httpServer, config, 1);

    // console.log('user1', user1);
    // console.log('user2', user2);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('test one comment', () => {
    it("shouldn't create comment, because user is not authorized", async () => {
      const comment: CommentInputDto = {
        content: 'test comment',
      };
      await request(httpServer)
        .post(`${paths.posts}/${posts[0].id}/comments`)
        .send(comment)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("shouldn't not create too short comment", async () => {
      const shortComment: CommentInputDto = {
        content: 'ag',
      };

      await request(httpServer)
        .post(`${paths.posts}/${posts[0].id}/comments`)
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .send(shortComment)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it("shouldn't not create too long comment", async () => {
      const longComment: CommentInputDto = {
        content: getStringWithLength(303),
      };
      await request(httpServer)
        .post(`${paths.posts}/${posts[0].id}/comments`)
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .send(longComment)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it("shouldn't create comment with invalid post id", async () => {
      const comment: CommentInputDto = {
        content: getStringWithLength(100),
      };
      await request(httpServer)
        .post(`${paths.posts}/${new ObjectId().toString()}/comments`)
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .send(comment)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should create comment ', async () => {
      const comment: CommentInputDto = {
        content: getStringWithLength(100),
      };
      const req = await request(httpServer)
        .post(`${paths.posts}/${posts[0].id}/comments`)
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .send(comment)
        .expect(HttpStatus.CREATED);

      // const reqBody: TCommentViewModel = {
      //     id: req.body.id,
      //     content: req.body.content,
      //     commentatorInfo: {
      //         userId: req.body.commentatorInfo.userId,
      //         userLogin: req.body.commentatorInfo.userLogin,
      //     },
      //     createdAt: req.body.createdAt,
      // }

      expect(req.body).toEqual({
        /*TCommentViewModel */ id: expect.any(String),
        content: comment.content,
        commentatorInfo: {
          userId: user1.id,
          userLogin: user1.login,
        },
        likesInfo: {
          dislikesCount: expect.any(Number),
          likesCount: expect.any(Number),
          myStatus: expect.any(String),
        },
        createdAt: expect.any(String),
      });
    });
  });

  describe('test with three posts', () => {
    const createdCommentsPost1: CommentViewDto[] = [];
    const createdCommentsPost2: CommentViewDto[] = [];

    it('should create 7 comments for first post and 13 for second', async () => {
      for (let i = 0; i < 7; i++) {
        const comment: CommentInputDto = {
          content: getStringWithLength(_.random(20, 300)),
        };
        const req = await request(httpServer)
          .post(`${paths.posts}/${posts[1].id}/comments`)
          .set('Authorization', `Bearer ${user1.accessToken}`)
          .send(comment)
          .expect(HttpStatus.CREATED);

        createdCommentsPost1.push(req.body);
      }

      for (let i = 0; i < 13; i++) {
        const comment: CommentInputDto = {
          content: getStringWithLength(_.random(20, 300)),
        };
        const req = await request(httpServer)
          .post(`${paths.posts}/${posts[2].id}/comments`)
          .set('Authorization', `Bearer ${user1.accessToken}`)
          .send(comment)
          .expect(HttpStatus.CREATED);

        createdCommentsPost2.push(req.body);
      }
    });

    it('should get 7 comments for first post', async () => {
      const req = await request(httpServer).get(`${paths.posts}/${posts[1].id}/comments`).expect(HttpStatus.OK);

      expect(req.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 7,
        items: createdCommentsPost1.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      });
    });

    it('should get first page of 10 comments for second post', async () => {
      const req = await request(httpServer).get(`${paths.posts}/${posts[2].id}/comments`).expect(HttpStatus.OK);

      expect(req.body).toEqual({
        pagesCount: 2,
        page: 1,
        pageSize: 10,
        totalCount: 13,
        items: createdCommentsPost2
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice()
          .splice(0, 10),
      });
    });

    it('should get second page of 3 comments for second post', async () => {
      const req = await request(httpServer)
        .get(`${paths.posts}/${posts[2].id}/comments?pageNumber=2`)
        .expect(HttpStatus.OK);

      expect(req.body).toEqual({
        pagesCount: 2,
        page: 2,
        pageSize: 10,
        totalCount: 13,
        items: createdCommentsPost2
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice()
          .splice(10),
      });
    });

    it('should return NotFound for invalid post id', async () => {
      await request(httpServer)
        .get(`${paths.posts}/${new ObjectId().toString()}/comments`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('get, put and delete comment', () => {
    let workingComment: CommentViewDto;

    it('should create comment', async () => {
      const comment: CommentInputDto = {
        content: getStringWithLength(100),
      };
      const req = await request(httpServer)
        .post(`${paths.posts}/${posts[3].id}/comments`)
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .send(comment)
        .expect(HttpStatus.CREATED);

      workingComment = req.body;
    });

    it('should get comment by id', async () => {
      const req = await request(httpServer).get(`${paths.comments}/${workingComment.id}`).expect(HttpStatus.OK);

      expect(req.body).toEqual(workingComment);
    });

    it("shouldn't update comment, because user is not authorized", async () => {
      const comment: CommentInputDto = {
        content: getStringWithLength(100),
      };
      await request(httpServer)
        .put(`${paths.comments}/${workingComment.id}`)
        .send(comment)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("shouldn't update comment, because user is not owner", async () => {
      const comment: CommentInputDto = {
        content: getStringWithLength(100),
      };
      await request(httpServer)
        .put(`${paths.comments}/${workingComment.id}`)
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .send(comment)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should update comment', async () => {
      const comment: CommentInputDto = {
        content: getStringWithLength(150),
      };
      await request(httpServer)
        .put(`${paths.comments}/${workingComment.id}`)
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .send(comment)
        .expect(HttpStatus.NO_CONTENT);

      const req = await request(httpServer).get(`${paths.comments}/${workingComment.id}`).expect(HttpStatus.OK);

      expect(req.body).toEqual({
        id: workingComment.id,
        content: comment.content,
        commentatorInfo: {
          userId: user2.id,
          userLogin: user2.login,
        },
        createdAt: workingComment.createdAt,
        likesInfo: workingComment.likesInfo,
      });
    });

    it("shouldn't delete comment, because user is not authorized", async () => {
      await request(httpServer).delete(`${paths.comments}/${workingComment.id}`).expect(HttpStatus.UNAUTHORIZED);
    });

    it("shouldn't delete comment, because user is not owner", async () => {
      await request(httpServer)
        .delete(`${paths.comments}/${workingComment.id}`)
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should delete comment', async () => {
      await request(httpServer)
        .delete(`${paths.comments}/${workingComment.id}`)
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .expect(HttpStatus.NO_CONTENT);

      await request(httpServer).get(`${paths.comments}/${workingComment.id}`).expect(HttpStatus.NOT_FOUND);
    });

    it('should return NotFound trying to delete non-existent comment', async () => {
      await request(httpServer)
        .delete(`${paths.comments}/${new ObjectId().toString()}`)
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
