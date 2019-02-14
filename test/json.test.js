'use strict';

const request = require('supertest');
const parse = require('..');
const koa = require('koa');

describe('parse.json(req, opts)', function() {
  describe('with valid json', function() {
    it('should parse', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        const body = await parse.json(ctx);
        body.should.eql({ foo: 'bar' });
        done();
      });

      request(app.callback())
        .post('/')
        .send({ foo: 'bar' })
        .end(function() {});
    });
  });

  describe('with invalid content encoding', function() {
    it('should throw 415', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        const body = await parse.json(ctx);
        body.foo.bar.should.equal('baz');
        ctx.status = 200;
      });

      request(app.callback())
        .post('/')
        .type('json')
        .set('content-encoding', 'invalid')
        .send({ foo: { bar: 'baz' } })
        .expect(415, done);
    });
  });

  describe('with content-length zero', function() {
    describe('and strict === false', function() {
      it('should return null', function(done) {
        const app = new koa();

        app.use(async function (ctx) {
          const body = await parse.json(ctx, { strict: false });
          body.should.equal('');
          done();
        });
        request(app.callback())
          .post('/')
          .set('content-length', 0)
          .end(function() {});
      });
    });

    describe('and strict === true', function() {
      it('should return null', function(done) {
        const app = new koa();

        app.use(async function (ctx) {
          const body = await parse.json(ctx);
          body.should.eql({});
          done();
        });
        request(app.callback())
          .post('/')
          .set('content-length', 0)
          .end(function() {});
      });
    });
  });

  describe('with invalid json', function() {
    it('should parse error', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        try {
          await parse.json(ctx);
        } catch (err) {
          err.status.should.equal(400);
          err.body.should.equal('{"foo": "bar');
          done();
        }
      });

      request(app.callback())
        .post('/')
        .set('content-type', 'application/json')
        .send('{"foo": "bar')
        .end(function() {});
    });
  });

  describe('with non-object json', function() {
    describe('and strict === false', function() {
      it('should parse', function(done) {
        const app = new koa();

        app.use(async function (ctx) {
          const body = await parse.json(ctx, { strict: false });
          body.should.equal('foo');
          done();
        });

        request(app.callback())
          .post('/')
          .set('content-type', 'application/json')
          .send('"foo"')
          .end(function() {});
      });
    });

    describe('and strict === true', function() {
      it('should parse', function(done) {
        const app = new koa();

        app.use(async function (ctx) {
          try {
            await parse.json(ctx, { strict: true });
          } catch (err) {
            err.status.should.equal(400);
            err.body.should.equal('"foo"');
            err.message.should.equal('invalid JSON, only supports object and array');
            done();
          }
        });

        request(app.callback())
          .post('/')
          .set('content-type', 'application/json')
          .send('"foo"')
          .end(function() {});
      });
    });
  });

  describe('returnRawBody', function() {
    it('should return raw body when opts.returnRawBody = true', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        ctx.body = await parse.json(ctx, { returnRawBody: true });
      });

      request(app.callback())
        .post('/')
        .type('json')
        .send({ foo: 'bar' })
        .expect({ parsed: { foo: 'bar' }, raw: '{"foo":"bar"}' })
        .expect(200, done);
    });
  });

  describe('JSON poisoning', function() {
    it('remove inline __proto__ properties', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        ctx.body = await parse.json(ctx, { returnRawBody: true });
      });

      const body = '{"foo": "bar", "__proto__": { "admin": true }}'

      request(app.callback())
        .post('/')
        .type('json')
        .send(body)
        .expect(function (res) {
          res.body = { isAdmin: res.body.parsed.__proto__.admin }
        })
        .expect({ isAdmin: undefined })
        .expect(200, done);
    });

    it('remove nested inline __proto__ properties', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        ctx.body = await parse.json(ctx, { returnRawBody: true });
      });

      const body = '{"user": { "name": "virk", "__proto__": { "admin": true } }}'

      request(app.callback())
        .post('/')
        .type('json')
        .send(body)
        .expect(function (res) {
          res.body = { isAdmin: res.body.parsed.user.__proto__.admin }
        })
        .expect({ isAdmin: undefined })
        .expect(200, done);
    });

    it('error on inline __proto__ properties', function(done) {
      const app = new koa();

      app.use(async function (ctx) {
        try {
          await parse.json(ctx, { returnRawBody: true, protoAction: 'error' });
        } catch (err) {
          err.status.should.equal(400);
          err.body.should.equal('{"foo": "bar", "__proto__": { "admin": true }}');
          err.message.should.equal('Object contains forbidden prototype property');
          done();
        }
      });

      const body = '{"foo": "bar", "__proto__": { "admin": true }}'

      request(app.callback())
        .post('/')
        .type('json')
        .send(body)
        .end(function() {});
    });
  });

  it('ignore inline __proto__ properties', function(done) {
    const app = new koa();

    app.use(async function (ctx) {
      ctx.body = await parse.json(ctx, { returnRawBody: true, protoAction: 'ignore' });
    });

    const body = '{ "name": "virk", "__proto__": { "admin": true } }'

    request(app.callback())
      .post('/')
      .type('json')
      .send(body)
      .expect(function (res) {
        res.body = { isAdmin: res.body.parsed.__proto__.admin }
      })
      .expect({ isAdmin: true })
      .expect(200, done);
  });
});
