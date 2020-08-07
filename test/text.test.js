'use strict';

const request = require('supertest');
const parse = require('..');
const koa = require('koa');
const Buffer = require('buffer').Buffer;

describe('parse.text(req, opts)', function() {
  describe('with valid str', function() {
    it('should parse', function(done) {
      const app = koa();

      app.use(function* () {
        this.body = yield parse.text(this);
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
      const app = koa();

      app.use(function* () {
        yield parse.text(this);
        this.status = 200;
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
      const app = koa();

      app.use(function* () {
        this.body = yield parse.text(this, { returnRawBody: true });
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
      const app = koa();

      app.use(function* () {
        const requestBody = yield parse.text(this, { encoding: false });
        this.body = { isBuffer: Buffer.isBuffer(requestBody) };
      });

      request(app.callback())
        .post('/')
        .send('Hello World!')
        .expect({ isBuffer: true })
        .expect(200, done);
    });
  });
  describe('transformBody', function() {
    it('should return transform request body result when opts.transformBody is a function', function(done) {
      const app = koa();

      app.use(function* () {
        const requestBody = yield parse.text(this, { 
          transformBody: function(str) {
            return str + ' World!';
          }
        });
        this.body = requestBody;
      });

      request(app.callback())
        .post('/')
        .send('Hello')
        .expect("Hello World!")
        .expect(200, done);
    });
  });
});
