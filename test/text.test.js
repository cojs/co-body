'use strict';

const request = require('supertest');
const parse = require('..');
const koa = require('koa');
const Buffer = require('buffer').Buffer;

describe('parse.text(req, opts)', function() {
  describe('with valid str', function() {
    it('should parse', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        ctx.body = await parse.text(ctx);
      });

      request(app.callback())
        .post('/')
        .send('Hello World!')
        .expect(200)
        .expect('Hello World!', done);
    });
  });

  describe('with invalid content encoding', function() {
    it('should throw 415', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        await parse.text(ctx);
        ctx.status = 200;
      });

      request(app.callback())
        .post('/')
        .set('content-encoding', 'invalid')
        .send('Hello World!')
        .expect(415, done);
    });
  });

  describe('returnRawBody', function() {
    it('should return raw body when opts.returnRawBody = true', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        ctx.body = await parse.text(ctx, { returnRawBody: true });
      });

      request(app.callback())
        .post('/')
        .send('Hello World!')
        .expect({ parsed: 'Hello World!', raw: 'Hello World!' })
        .expect(200, done);
    });
  });

  describe('use no encoding', function() {
    it('should return raw body when opts.returnRawBody = true', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        const requestBody = await parse.text(ctx, { encoding: false });
        ctx.body = { isBuffer: Buffer.isBuffer(requestBody) };
      });

      request(app.callback())
        .post('/')
        .send('Hello World!')
        .expect({ isBuffer: true })
        .expect(200, done);
    });
  });
});
