'use strict';

const request = require('supertest');
const parse = require('..');
const koa = require('koa');
const zlib = require('zlib');

describe('parse(req, opts)', function() {
  describe('with valid form body', function() {
    it('should parse', function(done) {
      const app = new koa();

      app.use(async function(ctx) {
        const body = await parse(ctx);
        body.foo.bar.should.equal('baz');
        done();
      });

      request(app.callback())
        .post('/')
        .type('form')
        .send({ foo: { bar: 'baz' } })
        .end(function() {});
    });
  });

  describe('with valid json', function() {
    it('should parse', function(done) {
      const app = new koa();

      app.use(async function(ctx) {
        const body = await parse(ctx);
        body.should.eql({ foo: 'bar' });
        done();
      });

      request(app.callback())
        .post('/')
        .send({ foo: 'bar' })
        .end(function() {});
    });
  });

  describe('with valid text', function() {
    it('should parse', function(done) {
      const app = new koa();

      app.use(async function(ctx) {
        ctx.body = await parse(ctx);
      });

      request(app.callback())
        .post('/')
        .set('content-type', 'text/plain')
        .send('plain text')
        .expect(200)
        .expect('plain text', done);
    });
  });

  describe('with know json content-type', function() {
    const app = new koa();

    app.use(async function(ctx) {
      ctx.body = await parse(ctx);
    });

    it('should parse application/json-patch+json', function(done) {
      request(app.callback())
        .post('/')
        .type('application/json-patch+json')
        .send(JSON.stringify([{ op: 'replace', path: '/foo', value: 'bar' }]))
        .expect(200)
        .expect([{ op: 'replace', path: '/foo', value: 'bar' }], done);
    });

    it('should parse application/vnd.api+json', function(done) {
      request(app.callback())
        .post('/')
        .type('application/vnd.api+json')
        .send(JSON.stringify({ posts: '1' }))
        .expect(200)
        .expect({ posts: '1' }, done);
    });

    it('should parse application/csp-report', function(done) {
      request(app.callback())
        .post('/')
        .type('application/csp-report')
        .send(JSON.stringify({ posts: '1' }))
        .expect(200)
        .expect({ posts: '1' }, done);
    });

    it('should parse application/ld+json', function(done) {
      request(app.callback())
        .post('/')
        .type('application/ld+json')
        .send(JSON.stringify({ posts: '1' }))
        .expect(200)
        .expect({ posts: '1' }, done);
    });
  });

  describe('with custom types', function() {
    it('should parse html as text', function(done) {
      const app = new koa();

      app.use(async function(ctx) {
        const body = await parse(ctx, { textTypes: 'text/html' });
        ctx.body = body;
      });

      request(app.callback())
        .post('/')
        .set('Content-Type', 'text/html')
        .send('<h1>html text</ht>')
        .expect('<h1>html text</ht>', done);
    });

    it('should parse graphql as text', function(done) {
      const app = new koa();

      app.use(async function(ctx) {
        const body = await parse(ctx, { textTypes: [ 'application/graphql', 'text/html' ] });
        ctx.body = body;
      });

      const graphql = '{\n  user(id: 4) {\n    name\n  }\n}';

      request(app.callback())
        .post('/')
        .set('Content-Type', 'application/graphql')
        .send(graphql)
        .expect(graphql, done);
    });
  });

  describe('with missing content-type', function() {
    it('should fail with 415', function(done) {
      const app = new koa();

      app.use(async function(ctx) {
        await parse(ctx);
      });

      request(app.callback())
        .post('/')
        .expect(415, 'Unsupported Media Type', done);
    });
  });

  describe('with content-encoding', function() {
    it('should inflate gzip', function(done) {
      const app = new koa();
      const json = JSON.stringify({ foo: 'bar' });

      app.use(async function(ctx) {
        const body = await parse(ctx);
        body.should.eql({ foo: 'bar' });
        done();
      });

      const req = request(app.callback())
        .post('/')
        .type('json')
        .set('Content-Encoding', 'gzip');
      req.write(zlib.gzipSync(json));
      req.end(function() {});
    });
    it('should inflate deflate', function(done) {
      const app = new koa();
      const json = JSON.stringify({ foo: 'bar' });

      app.use(async function(ctx) {
        const body = await parse(ctx);
        body.should.eql({ foo: 'bar' });
        done();
      });

      const req = request(app.callback())
        .post('/')
        .type('json')
        .set('Content-Encoding', 'deflate');
      req.write(zlib.deflateSync(json));
      req.end(function() {});
    });

    describe('after indentity and with shared options', function() {
      const app = new koa();
      const options = {};
      app.use(async function(ctx) {
        ctx.body = await parse(ctx, options);
      });

      before(function(done) {
        request(app.callback())
          .post('/')
          .set('Content-Encoding', 'identity')
          .send({ foo: 'bar', and: 'something extra' })
          .expect(200, done);
      });

      it('should inflate deflate', function(done) {
        const json = JSON.stringify({ foo: 'bar' });
        const req = request(app.callback())
          .post('/')
          .type('json')
          .set('Content-Encoding', 'deflate');
        req.write(zlib.deflateSync(json));
        req.expect(200, done);
      });
    });

    it('should pass-through identity', function(done) {
      const app = new koa();

      app.use(async function(ctx) {
        const body = await parse(ctx);
        body.should.eql({ foo: 'bar' });
        done();
      });

      request(app.callback())
        .post('/')
        .set('Content-Encoding', 'identity')
        .send({ foo: 'bar' })
        .end(function() {});
    });
  });

});
