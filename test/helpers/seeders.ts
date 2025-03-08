import request from 'supertest';
import { paths } from '../../src/common/paths';
import { mockUsers } from './mock-data';
import { App } from 'supertest/types';
import { encodeToBase64 } from '../../src/core/utils/base-64';
import { CreateUserInputDto } from '../../src/modules/user-accounts/api/input-dto/users.input-dto';
import { UserViewDto } from '../../src/modules/user-accounts/api/view-dto/user.view-dto';
import { LoginInputDto } from '../../src/modules/user-accounts/api/input-dto/login.input-dto';
import { HttpStatus } from '@nestjs/common';
import { CoreConfig } from '../../src/core/core.config';

export type CreatedUser = {
  id: string;
  email: string;
  login: string;
  password: string;
  createdAt: string;
  accessToken?: string;
};

export type LoginedUser = {
  id: string;
  email: string;
  login: string;
  password: string;
  accessToken: string;
};

export const e2eSeeder = {
  async createAndLoginUser(httpServer: App, config: CoreConfig): Promise<LoginedUser> {
    const userInput: CreateUserInputDto = {
      email: 'example@example.com',
      login: 'login',
      password: 'password',
    };

    const res1 = await request(httpServer)
      .post(paths.users)
      .set('Authorization', `Basic ${encodeToBase64(config.adminAuth)}`)
      .send(userInput);

    const reqBody: UserViewDto = res1.body;

    const authInput: LoginInputDto = {
      loginOrEmail: userInput.login,
      password: userInput.password,
    };

    const reqs2 = await request(httpServer).post(paths.auth.login).send(authInput);

    const accessToken = reqs2.body.accessToken;

    const res3 = await request(httpServer)
      .get(paths.auth.me)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    return {
      id: reqBody.id,
      email: reqBody.email,
      login: reqBody.login,
      password: userInput.password,
      accessToken,
    };
  },

  async users(httpServer: App, count: number, config: CoreConfig): Promise<CreatedUser[]> {
    const createdUsers: CreatedUser[] = [];

    let mockUserInd = 0;

    for (let i = 0; i < count; i++) {
      let user = mockUsers[mockUserInd];

      if (!user) {
        mockUserInd = 0;
        user = mockUsers[mockUserInd];
      }

      const req = await request(httpServer)
        .post(paths.users)
        .set('Authorization', `Basic ${encodeToBase64(config.adminAuth)}`)
        .send(user);

      /* const reqBody: UserViewModel = {
           id: req.body.id,
           email: req.body.email,
           login: req.body.login,
           createdAt: req.body.createdAt,
       }*/

      const createdUser = {
        id: req.body.id,
        email: req.body.email,
        login: req.body.login,
        createdAt: req.body.createdAt,
        password: user.password,
      };

      createdUsers.push(createdUser);

      mockUserInd++;
    }

    return createdUsers;
  },

  // async blogs(count: number): Promise<BlogViewModel[]> {
  //   const createdBlogs: BlogViewModel[] = [];
  //
  //   for (let i = 0; i < count; i++) {
  //     const blog = validBlogs[i];
  //
  //     if (!blog) break;
  //
  //     const req = await request(app)
  //       .post(paths.blogs)
  //       .set('Authorization', `Basic ${encodeToBase64(appConfig.adminAuth)}`)
  //       .send(blog)
  //       .expect(HttpStatus.Created);
  //
  //     expect(req.body).toEqual({
  //       id: expect.any(String),
  //       name: blog.name,
  //       description: blog.description,
  //       websiteUrl: blog.websiteUrl,
  //       createdAt: expect.any(String),
  //       isMembership: expect.any(Boolean),
  //     });
  //
  //     const createdBlog: BlogViewModel = {
  //       id: req.body.id,
  //       name: req.body.name,
  //       description: req.body.description,
  //       websiteUrl: req.body.websiteUrl,
  //       createdAt: req.body.createdAt,
  //       isMembership: req.body.isMembership,
  //     };
  //
  //     createdBlogs.push(createdBlog);
  //   }
  //
  //   return createdBlogs;
  // },

  // async posts(count: number): Promise<PostViewModel[]> {
  //   const [blog] = await this.blogs(1);
  //
  //   const createdPosts: PostViewModel[] = [];
  //
  //   for (let i = 0; i < count; i++) {
  //     const post = validPosts[i];
  //
  //     if (!post) break;
  //
  //     const postInput: PostInputModel = {
  //       blogId: blog.id,
  //       content: post.content,
  //       shortDescription: post.shortDescription,
  //       title: post.title,
  //     };
  //
  //     const req = await request(app)
  //       .post(paths.posts)
  //       .set('Authorization', `Basic ${encodeToBase64(appConfig.adminAuth)}`)
  //       .send(postInput)
  //       .expect(HttpStatus.Created);
  //
  //     expect(req.body).toEqual({
  //       id: expect.any(String),
  //       title: post.title,
  //       shortDescription: post.shortDescription,
  //       content: post.content,
  //       blogId: blog.id,
  //       blogName: blog.name,
  //       createdAt: expect.any(String),
  //     });
  //
  //     const createdPost: PostViewModel = {
  //       id: req.body.id,
  //       title: post.title,
  //       shortDescription: post.shortDescription,
  //       content: post.content,
  //       blogId: blog.id,
  //       blogName: blog.name,
  //       createdAt: req.body.createdAt,
  //     };
  //
  //     createdPosts.push(createdPost);
  //   }
  //   return createdPosts;
  // },
};
