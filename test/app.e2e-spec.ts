import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('VidalStore API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health', () => {
    it('GET /health should return 200', async () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
        });
    });
  });

  describe('Library', () => {
    it('GET /v1/biblioteca without token should return 401', async () => {
      return request(app.getHttpServer())
        .get('/v1/biblioteca')
        .expect(401);
    });
  });

  describe('Purchase', () => {
    it('POST /v1/compras without token should return 401', async () => {
      return request(app.getHttpServer())
        .post('/v1/compras')
        .send({ gameId: 'game-1' })
        .expect(401);
    });
  });

  describe('Licenses', () => {
    it('GET /v1/licencias without token should return 401', async () => {
      return request(app.getHttpServer())
        .get('/v1/licencias')
        .expect(401);
    });
  });
});