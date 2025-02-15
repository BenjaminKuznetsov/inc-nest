import request from 'supertest';
import { paths } from '../src/common/paths';
import { validBlogs } from './helpers/mock-data';
// import { encodeToBase64 } from '../../src/common/helpers';
import { ObjectId } from 'mongodb';
import { isValidIsoDate } from './helpers/utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { BlogViewDto } from '../src/modules/bloggers-platform/blogs/dto/blog-view.dto';
import { appSetup } from '../src/setup/app.setup';

// const ADMIN_AUTH = appConfig.adminAuth;

describe('blogs', () => {
  let app: INestApplication<App>;
  let httpServer: App;

  const dbBlogs: BlogViewDto[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    await app.init();

    httpServer = app.getHttpServer();

    await request(httpServer)
      .delete(paths.testing)
      .expect(HttpStatus.NO_CONTENT);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return status 200 with empty array of blogs ', async () => {
    const response = await request(httpServer)
      .get(paths.blogs)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('items');
    expect(response.body.items.length).toBe(0);
    expect(response.body).toHaveProperty('pagesCount', 1);
    expect(response.body).toHaveProperty('page', 1);
    expect(response.body).toHaveProperty('pageSize', 10);
    expect(response.body).toHaveProperty('totalCount', 0);
  });

  // it("shouldn't create blog, because user is not authorized", async () => {
  //   const data = validBlogs[0];
  //   await request(httpServer)
  //     .post(paths.blogs)
  //     .send(data)
  //     .expect(HttpStatus.UNAUTHORIZED);
  // });

  // it("shouldn't create blog with incorrect auth credentials", async () => {
  //   const newBlog = validBlogs[0];
  //   await request(httpServer)
  //     .post(paths.blogs)
  //     .set('Authorization', 'Basic qwerty:qwerty')
  //     .send(newBlog)
  //     .expect(HttpStatus.UNAUTHORIZED);
  // });

  // it("shouldn't create blog with incorrect input data", async () => {
  //   for (const data of invalidBlogs) {
  //     await request(httpServer)
  //       .post(paths.blogs)
  //       // .set('Authorization', `Basic ${encodeToBase64(ADMIN_AUTH)}`)
  //       .send(data)
  //       .expect(HttpStatus.BAD_REQUEST);
  //   }
  // });

  it('should create some blogs and then find it by id', async () => {
    for (const data of validBlogs) {
      const response1 = await request(httpServer)
        .post(paths.blogs)
        // .set('Authorization', `Basic ${encodeToBase64(ADMIN_AUTH)}`)
        .send(data)
        .expect(HttpStatus.CREATED);

      const createdBlog = response1.body;
      expect(createdBlog.id).toBeDefined();
      expect(createdBlog.name).toBe(data.name);
      expect(createdBlog.description).toBe(data.description);
      expect(createdBlog.websiteUrl).toBe(data.websiteUrl);
      expect(isValidIsoDate(createdBlog.createdAt)).toBe(true);
      expect(createdBlog.isMembership).toBe(false);

      const response2 = await request(httpServer)
        .get(`${paths.blogs}/${createdBlog.id}`)
        .expect(HttpStatus.OK);
      const foundBlog = response2.body;

      expect(foundBlog.id).toBe(createdBlog.id);
      dbBlogs.push(foundBlog);
    }
  });

  it("shouldn't find blog with non-existent id", async () => {
    const id = new ObjectId().toString();
    await request(httpServer)
      .get(`${paths.blogs}/${id}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should return all blogs', async () => {
    const response = await request(httpServer)
      .get(paths.blogs)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('items');
    expect(response.body.items.length).toBeLessThanOrEqual(10);
    expect(response.body).toHaveProperty('pagesCount', 1);
    expect(response.body).toHaveProperty('page', 1);
    expect(response.body).toHaveProperty('pageSize', 10);
    expect(response.body).toHaveProperty('totalCount', validBlogs.length);
  });

  // it("shouldn't update blog, because user is not authorized", async () => {
  //   const blogId = dbBlogs[0].id;
  //   const data = validBlogs[5];
  //   await request(httpServer)
  //     .put(`${paths.blogs}/${blogId}`)
  //     .send(data)
  //     .expect(HttpStatus.UNAUTHORIZED);
  // });

  // it("shouldn't update blog with incorrect input data", async () => {
  //   for (const data of invalidBlogs) {
  //     const blogId = dbBlogs[0].id;
  //     const response = await request(httpServer)
  //       .put(`${paths.blogs}/${blogId}`)
  //       // .set('Authorization', `Basic ${encodeToBase64(ADMIN_AUTH)}`)
  //       .send(data)
  //       .expect(HttpStatus.BAD_REQUEST);
  //     // console.log(JSON.stringify(response.body, null, 2))
  //   }
  // });

  it("shouldn't update blog with non-existent id", async () => {
    const blogId = new ObjectId().toString();
    const data = validBlogs[0];
    await request(httpServer)
      .put(`${paths.blogs}/${blogId}`)
      // .set('Authorization', `Basic ${encodeToBase64(ADMIN_AUTH)}`)
      .send(data)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should update blog with correct data', async () => {
    const blogId = dbBlogs[0].id;
    const data = validBlogs[0];
    await request(httpServer)
      .put(`${paths.blogs}/${blogId}`)
      // .set('Authorization', `Basic ${encodeToBase64(ADMIN_AUTH)}`)
      .send(data)
      .expect(HttpStatus.NO_CONTENT);

    const response = await request(httpServer)
      .get(`${paths.blogs}/${blogId}`)
      .expect(HttpStatus.OK);
    const updatedBlog = response.body;

    expect(updatedBlog.id).toBe(blogId);
    expect(updatedBlog.name).toBe(data.name);
    expect(updatedBlog.description).toBe(data.description);
    expect(updatedBlog.websiteUrl).toBe(data.websiteUrl);
  });

  // it("shouldn't delete blog, because user is not authorized", async () => {
  //   const blogId = dbBlogs[0].id;
  //   await request(httpServer)
  //     .delete(`${paths.blogs}/${blogId}`)
  //     .expect(HttpStatus.UNAUTHORIZED);
  // });

  it("shouldn't delete blog with non-existent id", async () => {
    const blogId = new ObjectId().toString();
    await request(httpServer)
      .delete(`${paths.blogs}/${blogId}`)
      // .set('Authorization', `Basic ${encodeToBase64(ADMIN_AUTH)}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should delete blog with correct id', async () => {
    const blogId = dbBlogs[0].id;
    await request(httpServer)
      .delete(`${paths.blogs}/${blogId}`)
      // .set('Authorization', `Basic ${encodeToBase64(ADMIN_AUTH)}`)
      .expect(HttpStatus.NO_CONTENT);

    const response = await request(httpServer)
      .get(paths.blogs)
      .expect(HttpStatus.OK);
    console.log('response.body', response.body);
    expect(response.body).toHaveProperty('totalCount', dbBlogs.length - 1);
  });
});
