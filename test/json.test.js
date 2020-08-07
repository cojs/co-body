'use strict';

const request = require('supertest');
const parse = require('..');
const koa = require('koa');
const JSONbig = require('json-bigint');

describe('parse.json(req, opts)', function() {
  describe('with valid json', function() {
    it('should parse', function(done) {
      const app = koa();

      app.use(function* () {
        const body = yield parse.json(this);
        body.should.eql({ foo: 'bar' });
        done();
      });

      request(app.callback())
        .post('/')
        .send({ foo: 'bar' })
        .end(function() { });
    });
  });

  describe('with invalid content encoding', function() {
    it('should throw 415', function(done) {
      const app = koa();

      app.use(function* () {
        const body = yield parse.json(this);
        body.foo.bar.should.equal('baz');
        this.status = 200;
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
        const app = koa();

        app.use(function* () {
          const body = yield parse.json(this, { strict: false });
          body.should.equal('');
          done();
        });
        request(app.callback())
          .post('/')
          .set('content-length', 0)
          .end(function() { });
      });
    });

    describe('and strict === true', function() {
      it('should return null', function(done) {
        const app = koa();

        app.use(function* () {
          const body = yield parse.json(this);
          body.should.eql({});
          done();
        });
        request(app.callback())
          .post('/')
          .set('content-length', 0)
          .end(function() { });
      });
    });
  });

  describe('with invalid json', function() {
    it('should parse error', function(done) {
      const app = koa();

      app.use(function* () {
        try {
          yield parse.json(this);
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
        .end(function() { });
    });
  });

  describe('with non-object json', function() {
    describe('and strict === false', function() {
      it('should parse', function(done) {
        const app = koa();

        app.use(function* () {
          const body = yield parse.json(this, { strict: false });
          body.should.equal('foo');
          done();
        });

        request(app.callback())
          .post('/')
          .set('content-type', 'application/json')
          .send('"foo"')
          .end(function() { });
      });
    });

    describe('and strict === true', function() {
      it('should parse', function(done) {
        const app = koa();

        app.use(function* () {
          try {
            yield parse.json(this, { strict: true });
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
          .end(function() { });
      });
    });
  });

  describe('returnRawBody', function() {
    it('should return raw body when opts.returnRawBody = true', function(done) {
      const app = koa();

      app.use(function* () {
        this.body = yield parse.json(this, { returnRawBody: true });
      });

      request(app.callback())
        .post('/')
        .type('json')
        .send({ foo: 'bar' })
        .expect({ parsed: { foo: 'bar' }, raw: '{"foo":"bar"}' })
        .expect(200, done);
    });
  });

  describe('transformBody', function() {
    it('should return transform request body result when opts.transformBody is a function', function(done) {
      const app = koa();
      app.use(function* () {
        const transformBodyFunc = function(str) {
          return JSONbig.parse(str);
        };
        const parsed = yield parse.json(this, {
          transformBody: transformBodyFunc,
        });
        this.body = parsed.id.toString();
      });
      request(app.callback())
        .post('/')
        .type('json')
        .send('{ "id": 9223372036854775807 }')
        .expect('9223372036854775807')
        .expect(200, done);
    });
  });
});
