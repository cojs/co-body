'use strict';

const request = require('supertest');
const parse = require('..');
const koa = require('koa');

describe('parse.form(req, opts)', function() {
  describe('with valid form body', function() {
    it('should parse', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        const body = await parse.form(ctx);
        body.foo.bar.should.equal('baz');
        ctx.status = 200;
      });

      request(app.callback())
        .post('/')
        .type('form')
        .send({ foo: { bar: 'baz' } })
        .end(function(err) { done(err); });
    });
  });

  describe('with invalid content encoding', function() {
    it('should throw 415', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        const body = await parse.form(ctx);
        body.foo.bar.should.equal('baz');
        ctx.status = 200;
      });

      request(app.callback())
        .post('/')
        .type('form')
        .set('content-encoding', 'invalid')
        .send({ foo: { bar: 'baz' } })
        .expect(415, done);
    });
  });

  describe('with qs settings', function() {
    const data = { level1: { level2: { level3: { level4: { level5: { level6: { level7: 'Hello' } } } } } } };

    it('should not parse full depth', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        const body = await parse.form(ctx); // default to depth = 5
        body.level1.level2.level3.level4.level5.level6['[level7]'].should.equal('Hello');
        ctx.status = 200;
      });

      request(app.callback())
        .post('/')
        .type('form')
        .send({ level1: { level2: { level3: { level4: { level5: { level6: { level7: 'Hello' } } } } } } })
        .end(function(err) { done(err); });

    });

    it('should parse', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        const body = await parse.form(ctx, { queryString: { depth: 10 } });
        body.level1.level2.level3.level4.level5.level6.level7.should.equal('Hello');
        ctx.status = 200;
      });

      request(app.callback())
        .post('/')
        .type('form')
        .send(data)
        .end(function(err) { done(err); });
    });
  });

  describe('with custom qs module', function() {
    it('should parse with safe-qs', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        try {
          await parse.form(ctx, {
            qs: require('safe-qs'),
          });
          throw new Error('should not run this');
        } catch (err) {
          ctx.status = err.status;
          ctx.body = err.message;
        }
      });

      request(app.callback())
        .post('/')
        .type('form')
        .send({ a: { 21: 'a' } })
        .expect('Index of array [21] is overstep limit: 20')
        .expect(400, done);
    });
  });

  describe('allowDots', function() {
    it('should allowDots default to true', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        ctx.body = await parse.form(ctx);
      });

      request(app.callback())
        .post('/')
        .type('form')
        .send('a.b=1&a.c=2')
        .expect({ a: { b: '1', c: '2' } })
        .expect(200, done);
    });

    it('allowDots can set to false', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        ctx.body = await parse.form(ctx, { queryString: { allowDots: false } });
      });

      request(app.callback())
        .post('/')
        .type('form')
        .send('a.b=1&a.c=2')
        .expect({ 'a.b': '1', 'a.c': '2' })
        .expect(200, done);
    });
  });

  describe('returnRawBody', function() {
    it('should return raw body when opts.returnRawBody = true', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        ctx.body = await parse.form(ctx, { returnRawBody: true });
      });

      request(app.callback())
        .post('/')
        .type('form')
        .send('a[b]=1&a[c]=2')
        .expect({ parsed: { a: { b: '1', c: '2' } }, raw: 'a[b]=1&a[c]=2' })
        .expect(200, done);
    });
  });

  describe('JSON poisoning', function() {
    it('remove inline __proto__ properties', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        ctx.body = await parse.form(ctx, { returnRawBody: true });
      });

      const body = 'foo=bar&__proto__[admin]=true'

      request(app.callback())
        .post('/')
        .type('form')
        .send(body)
        .expect(function (res) {
          res.body = { isAdmin: res.body.parsed.__proto__.admin }
        })
        .expect({ isAdmin: undefined })
        .expect(200, done);
    });
  });
});
