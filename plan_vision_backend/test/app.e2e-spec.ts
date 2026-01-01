import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request, {
  type SuperTest,
  type Test as SuperTestRequest,
} from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let httpRequest: SuperTest<SuperTestRequest>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({
      bodyParser: false,
    });
    await app.init();
    httpRequest = request(app.getHttpServer());
  });

  it('/ (GET)', async () => {
    await httpRequest.get('/').expect(200).expect('Hello World!');
  });
});
