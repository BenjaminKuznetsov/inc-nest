import request from 'supertest';
import { paths } from '../../src/core/paths';
import { mockUsers, validBlogs, validPosts } from './mock-data';
import { App } from 'supertest/types';
import { encodeToBase64 } from '../../src/core/utils/base-64';
import { CreateUserInputDto } from '../../src/modules/user-accounts/api/input-dto/users.input-dto';
import { UserViewDto } from '../../src/modules/user-accounts/api/view-dto/user.view-dto';
import { LoginInputDto } from '../../src/modules/user-accounts/api/input-dto/login.input-dto';
import { HttpStatus } from '@nestjs/common';
import { CoreConfig } from '../../src/core/core.config';
import { PostViewDto } from '../../src/modules/bloggers-platform/posts/dto/post-view.dto';
import { PostInputDto } from '../../src/modules/bloggers-platform/posts/dto/post-input.dto';
import { BlogViewDto } from '../../src/modules/bloggers-platform/blogs/dto/blog-view.dto';

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
  async createAndLoginUser(httpServer: App, config: CoreConfig, index: number = 0): Promise<LoginedUser> {
    const userInput: CreateUserInputDto = mockUsers[index];

    const res1 = await request(httpServer)
      .post(paths.users)
      .set('Authorization', `Basic ${encodeToBase64(config.adminAuth)}`)
      .send(userInput)
      .expect(HttpStatus.CREATED);

    const reqBody: UserViewDto = res1.body;

    const authInput: LoginInputDto = {
      loginOrEmail: userInput.login,
      password: userInput.password,
    };

    const reqs2 = await request(httpServer).post(paths.auth.login).send(authInput);

    const accessToken = reqs2.body.accessToken;

    await request(httpServer).get(paths.auth.me).set('Authorization', `Bearer ${accessToken}`).expect(HttpStatus.OK);

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

  async blogs(httpServer: App, count: number, config: CoreConfig): Promise<BlogViewDto[]> {
    const createdBlogs: BlogViewDto[] = [];

    for (let i = 0; i < count; i++) {
      const blog = validBlogs[i];

      if (!blog) break;

      const req = await request(httpServer)
        .post(paths.blogs)
        .set('Authorization', `Basic ${encodeToBase64(config.adminAuth)}`)
        .send(blog)
        .expect(HttpStatus.CREATED);

      expect(req.body).toEqual({
        id: expect.any(String),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: expect.any(String),
        isMembership: expect.any(Boolean),
      });

      const createdBlog: BlogViewDto = {
        id: req.body.id,
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl,
        createdAt: req.body.createdAt,
        isMembership: req.body.isMembership,
      };

      createdBlogs.push(createdBlog);
    }

    return createdBlogs;
  },

  async posts(httpServer: App, count: number, config: CoreConfig): Promise<PostViewDto[]> {
    const [blog] = await e2eSeeder.blogs(httpServer, 1, config);

    const createdPosts: PostViewDto[] = [];

    for (let i = 0; i < count; i++) {
      const post = validPosts[i];

      if (!post) break;

      const postInput: PostInputDto = {
        blogId: blog.id,
        content: post.content,
        shortDescription: post.shortDescription,
        title: post.title,
      };

      const req = await request(httpServer)
        .post(paths.posts)
        .set('Authorization', `Basic ${encodeToBase64(config.adminAuth)}`)
        .send(postInput)
        .expect(HttpStatus.CREATED);

      expect(req.body).toMatchObject({
        id: expect.any(String),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: blog.id,
        blogName: blog.name,
        createdAt: expect.any(String),
      });

      const createdPost: PostViewDto = {
        id: req.body.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: blog.id,
        blogName: blog.name,
        createdAt: req.body.createdAt,
        extendedLikesInfo: req.body.extendedLikesInfo,
      };

      createdPosts.push(createdPost);
    }
    return createdPosts;
  },
};
