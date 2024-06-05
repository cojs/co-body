'use strict';

const request = require('supertest');
const parse = require('..');
const koa = require('koa');

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
        .end(function() {});
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
          .end(function() {});
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
          .end(function() {});
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
          err.should.be.an.instanceOf(SyntaxError);
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
          .end(function() {});
      });
    });

    describe('and strict === true', function() {
      it('should parse', function(done) {
        const app = koa();

        app.use(function* () {
          try {
            yield parse.json(this, { strict: true });
          } catch (err) {
            err.should.be.an.instanceOf(SyntaxError);
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

  describe('with valid onProtoPoisoning', function() {
    it('should parse with onProtoPoisoning = "error" by default', function(done) {
      const app = koa();

      app.use(function* () {
        try {
          yield parse.json(this);
        } catch (err) {
          err.should.be.an.instanceOf(SyntaxError);
          err.message.should.equal('Object contains forbidden prototype property');
          err.status.should.equal(400);
          err.body.should.equal('{ "__proto__": { "boom": "💣" } }');
          done();
        }
      });

      request(app.callback())
        .post('/')
        .set('content-type', 'application/json')
        .send('{ "__proto__": { "boom": "💣" } }')
        .end(function() {});
    });

    it('should parse with onProtoPoisoning = "ignore"', function(done) {
      const app = koa();

      app.use(function* () {
        this.body = yield parse.json(this, { onProtoPoisoning: 'ignore' });
      });

      request(app.callback())
        .post('/')
        .set('content-type', 'application/json')
        .send('{ "__proto__": { "boom": "💣" }, "hello": "world" }')
        .expect({ ['__proto__']: { boom: '💣' }, hello: 'world' })
        .expect(200, done);
    });

    it('should parse with onProtoPoisoning = "remove"', function(done) {
      const app = koa();

      app.use(function* () {
        this.body = yield parse.json(this, { onProtoPoisoning: 'remove' });
      });

      request(app.callback())
        .post('/')
        .set('content-type', 'application/json')
        .send('{ "__proto__": { "boom": "💣" }, "hello": "world" }')
        .expect({ hello: 'world' })
        .expect(200, done);
    });
  });
});
