import request from 'supertest';
import { invalidPosts, validBlogs, validPosts } from './helpers/mock-data';
import { ObjectId } from 'mongodb';
import __ from 'lodash';
import { isValidIsoDate } from './helpers/utils';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { appSetup } from '../src/setup/app.setup';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { paths } from '../src/common/paths';
import { BlogViewDto } from '../src/modules/bloggers-platform/blogs/dto/blog-view.dto';
import { PostViewDto } from '../src/modules/bloggers-platform/posts/dto/post-view.dto';

// const ADMIN_AUTH = appConfig.adminAuth

describe('posts', () => {
  let app: INestApplication<App>;

  const dbBlogs: BlogViewDto[] = [];
  const dbPosts: PostViewDto[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    await app.init();

    await request(app.getHttpServer())
      .delete(paths.testing)
      .expect(HttpStatus.NO_CONTENT);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should seed blogs', async () => {
    for (const data of validBlogs) {
      const response1 = await request(app.getHttpServer())
        .post(paths.blogs)
        // .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`
        .send(data)
        .expect(HttpStatus.CREATED);

      const createdBlog = response1.body;
      dbBlogs.push(createdBlog);
    }
    expect(dbBlogs.length).toBe(validBlogs.length);
  });

  // it("shouldn't create post, because user is not authorized", async () => {
  //   const data = validPosts[0]
  //   await request(app.getHttpServer()).post(paths.posts).send(data).expect(HttpStatus.Unauthorized)
  // })

  // it("shouldn't create post, because user is not authorized (/blogs/{blogId}/posts)", async () => {
  //   const data = validPosts[0]
  //   await request(app.getHttpServer()).post(`${paths.blogs}/${dbBlogs[0].id}/posts`).send(data).expect(HttpStatus.Unauthorized)
  // })

  // it("shouldn't create post with incorrect auth credentials", async () => {
  //   const data = validPosts[0]
  //   await request(app.getHttpServer())
  //     .post(paths.posts)
  //     .set("Authorization", `Basic qwerty:qwerty`)
  //     .send(data)
  //     .expect(HttpStatus.Unauthorized)
  // })

  // it("shouldn't create post with incorrect auth credentials (/blogs/{blogId}/posts)", async () => {
  //   const data = validPosts[0]
  //   await request(app.getHttpServer())
  //     .post(`${paths.blogs}/${dbBlogs[0].id}/posts`)
  //     .set("Authorization", `Basic qwerty:qwerty`)
  //     .send(data)
  //     .expect(HttpStatus.Unauthorized)
  // })

  // it("shouldn't create post with incorrect input data", async () => {
  //   for (const data of invalidPosts) {
  //     await request(app.getHttpServer())
  //       .post(paths.posts)
  //       // .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`
  //       .send({ ...data, blogId: dbBlogs[0].id })
  //       .expect(HttpStatus.BAD_REQUEST);
  //   }
  // });

  // it("shouldn't create post with incorrect input data (/blogs/{blogId}/posts)", async () => {
  //   for (const data of invalidPosts) {
  //     await request(app.getHttpServer())
  //       .post(`${paths.blogs}/${dbBlogs[0].id}/posts`)
  //       // .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`
  //       .send(data)
  //       .expect(HttpStatus.BAD_REQUEST);
  //   }
  // });

  // it('shouldn`t create post with incorrect blog id', async () => {
  //   const data = validPosts[0];
  //   data.blogId = new ObjectId().toString();
  //   await request(app.getHttpServer())
  //     .post(paths.posts)
  //     // .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`
  //     .send(data)
  //     .expect(HttpStatus.BAD_REQUEST);
  // });

  // it('shouldn`t create post with incorrect blog id (/blogs/{blogId}/posts)', async () => {
  //   const data = validPosts[0];
  //   const blogId = new ObjectId().toString();
  //   await request(app.getHttpServer())
  //     .post(`${paths.blogs}/${blogId}/posts`)
  //     // .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`
  //     .send(data)
  //     .expect(HttpStatus.NOT_FOUND);
  // });

  it('should create some posts and then find it by id', async () => {
    for (const data of validPosts) {
      const blog: BlogViewDto = __.sample(dbBlogs) as BlogViewDto;
      expect(blog).toBeDefined();

      const response1 = await request(app.getHttpServer())
        .post(paths.posts)
        // .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`
        .send({ ...data, blogId: blog.id })
        .expect(HttpStatus.CREATED);

      // console.log(response1.body)

      const createdPost = response1.body;
      expect(createdPost.id).toBeDefined();
      expect(createdPost.title).toBe(data.title);
      expect(createdPost.shortDescription).toBe(data.shortDescription);
      expect(createdPost.content).toBe(data.content);
      expect(createdPost.blogId).toBe(blog.id);
      expect(createdPost.blogName).toBe(blog.name);
      expect(isValidIsoDate(createdPost.createdAt)).toBe(true);

      const response2 = await request(app.getHttpServer())
        .get(`${paths.posts}/${createdPost.id}`)
        .expect(HttpStatus.OK);
      const foundBlog = response2.body;

      expect(foundBlog.id).toBe(createdPost.id);
      dbPosts.push(foundBlog);
    }
  });

  it('should create some posts and then find it by id (/blogs/{blogId}/posts)', async () => {
    for (const data of validPosts) {
      const blog: BlogViewDto = __.sample(dbBlogs) as BlogViewDto;
      expect(blog).toBeDefined();

      const response1 = await request(app.getHttpServer())
        .post(`${paths.blogs}/${blog.id}/posts`)
        // .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`
        .send({ ...data })
        .expect(HttpStatus.CREATED);

      // console.log(response1.body)

      const createdPost = response1.body;
      expect(createdPost.id).toBeDefined();
      expect(createdPost.title).toBe(data.title);
      expect(createdPost.shortDescription).toBe(data.shortDescription);
      expect(createdPost.content).toBe(data.content);
      expect(createdPost.blogId).toBe(blog.id);
      expect(createdPost.blogName).toBe(blog.name);
      expect(isValidIsoDate(createdPost.createdAt)).toBe(true);

      const response2 = await request(app.getHttpServer())
        .get(`${paths.posts}/${createdPost.id}`)
        .expect(HttpStatus.OK);
      const foundBlog = response2.body;

      expect(foundBlog.id).toBe(createdPost.id);
      dbPosts.push(foundBlog);
    }
  });

  it("shouldn't find post with non-existent id", async () => {
    const id = new ObjectId().toString();
    await request(app.getHttpServer())
      .get(`${paths.posts}/${id}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should return first page of posts', async () => {
    const response = await request(app.getHttpServer())
      .get(paths.posts)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('items');
    expect(response.body).toHaveProperty('pagesCount');
    expect(response.body).toHaveProperty('page');
    expect(response.body).toHaveProperty('pageSize', 10);
    // console.log("response.body.totalCount", response.body.totalCount)
    // console.log("validPosts.length", validPosts.length)
    expect(response.body).toHaveProperty('totalCount', validPosts.length * 2);
  });

  it('GET /blogs/{blogId}/posts and GET /posts?blogId={blogId} should return same data', async () => {
    for (const blog of dbBlogs) {
      const response1 = await request(app.getHttpServer())
        .get(`${paths.blogs}/${blog.id}/posts`)
        .expect(HttpStatus.OK);
      const expectedCount = dbPosts.filter(
        (post) => post.blogId === blog.id,
      ).length;

      expect(response1.body.totalCount).toBe(expectedCount);
    }
  });

  it('should "/blogs/:blogId/posts": should return error if :id from uri param not found; status 404; ', async () => {
    const notExistingId = new ObjectId().toHexString();
    await request(app.getHttpServer())
      .get(`${paths.blogs}/${notExistingId}/posts`)
      .expect(HttpStatus.NOT_FOUND);
  });

  // it("shouldn't update post, because user is not authorized", async () => {
  //   const id = new ObjectId().toString()
  //   const data = validPosts[0]
  //   await request(app.getHttpServer()).put(`${paths.posts}/${id}`).send(data).expect(HttpStatus.Unauthorized)
  // })

  // it("shouldn't update post with incorrect input data", async () => {
  //   for (const data of invalidPosts) {
  //     const id = dbPosts[0].id
  //     const response = await request(app.getHttpServer())
  //       .put(`${paths.posts}/${id}`)
  //       // .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`
  //       .send(data)
  //       .expect(HttpStatus.BAD_REQUEST)
  //     // console.log(JSON.stringify(response.body, null, 2))
  //   }
  // })

  it("shouldn't update post with non-existent id", async () => {
    const postId = new ObjectId().toString();
    const data = validPosts[0];
    data.blogId = dbBlogs[0].id;
    const res = await request(app.getHttpServer())
      .put(`${paths.posts}/${postId}`)
      // .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`
      .send(data)
      .expect(HttpStatus.NOT_FOUND);
    // console.log("res", res.body)
  });

  // it("shouldn't update post with incorrect blog id", async () => {
  //   const postId = dbPosts[0].id;
  //   const data = validPosts[2];
  //   data.blogId = new ObjectId().toString();
  //   const res = await request(app.getHttpServer())
  //     .put(`${paths.posts}/${postId}`)
  //     // .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`
  //     .send(data)
  //     .expect(HttpStatus.BAD_REQUEST);
  //   // console.log(res.body)
  // });

  it('should update post with correct data', async () => {
    const post = dbPosts[0];
    const data = validPosts[2];
    const blog: BlogViewDto = dbBlogs.find(
      (blog) => blog.id === post.blogId,
    ) as BlogViewDto;
    expect(blog).toBeDefined();

    await request(app.getHttpServer())
      .put(`${paths.posts}/${post.id}`)
      // .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`
      .send({ ...data, blogId: blog.id })
      .expect(HttpStatus.NO_CONTENT);

    const res2 = await request(app.getHttpServer())
      .get(`${paths.posts}/${post.id}`)
      .expect(HttpStatus.OK);

    const updatedPost = res2.body;

    expect(updatedPost.id).toBe(post.id);
    expect(updatedPost.title).toBe(data.title);
    expect(updatedPost.shortDescription).toBe(data.shortDescription);
    expect(updatedPost.content).toBe(data.content);
    expect(updatedPost.blogId).toBe(blog.id);
    expect(updatedPost.blogName).toBe(blog.name);
  });

  // it("shouldn't delete post, because user is not authorized", async () => {
  //   const postId = dbPosts[0].id
  //   await request(app.getHttpServer()).delete(`${paths.posts}/${postId}`).expect(HttpStatus.Unauthorized)
  // })

  it("shouldn't delete post with non-existent id", async () => {
    const postId = new ObjectId().toString();
    await request(app.getHttpServer())
      .delete(`${paths.posts}/${postId}`)
      // .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should delete post with correct id', async () => {
    const postId = dbPosts[0].id;
    await request(app.getHttpServer())
      .delete(`${paths.posts}/${postId}`)
      // .set("Authorization", `Basic ${encodeToBase64(ADMIN_AUTH)}`
      .expect(HttpStatus.NO_CONTENT);
  });
});
