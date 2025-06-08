import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';

import { AppModule } from './../src/app.module';

dotenv.config({ path: '.env.testing' });

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    execSync('yarn prisma migrate dev --schema=prisma/schema.prisma --name init  ', {
      stdio: 'inherit',
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!!!');
  });
});
