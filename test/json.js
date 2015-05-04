
var request = require('supertest');
var parse = require('..');
var koa = require('koa');

describe('parse.json(req, opts)', function(){
  describe('with valid json', function(){
    it('should parse', function(done){
      var app = koa();

      app.use(function *(){
        var body = yield parse.json(this);
        body.should.eql({ foo: 'bar' });
        done();
      });

      request(app.listen())
      .post('/')
      .send({ foo: 'bar' })
      .end(function(){});
    })
  })

  describe('with content-length zero', function(){
    describe('and strict === false', function(){
      it('should return null', function(done) {
        var app = koa();

        app.use(function *() {
          var body = yield parse.json(this, {strict: false});
          body.should.equal('');
          done();
        });
        request(app.listen())
        .post('/')
        .set('content-length', 0)
        .end(function(){});
      })
    })

    describe('and strict === true', function(){
      it('should return null', function(done) {
        var app = koa();

        app.use(function *() {
          var body = yield parse.json(this);
          body.should.eql({});
          done();
        });
        request(app.listen())
        .post('/')
        .set('content-length', 0)
        .end(function(){});
      })
    })
  })

  describe('with invalid json', function(){
    it('should parse error', function(done){
      var app = koa();

      app.use(function *(){
        try {
          yield parse.json(this);
        } catch (err) {
          err.status.should.equal(400);
          err.body.should.equal('{"foo": "bar');
          done();
        }
      });

      request(app.listen())
      .post('/')
      .set('content-type', 'application/json')
      .send('{"foo": "bar')
      .end(function(){});
    })
  })

  describe('with non-object json', function(){
    describe('and strict === false', function(){
      it('should parse', function(done){
        var app = koa();

        app.use(function *(){
          var body = yield parse.json(this, {strict: false});
          body.should.equal('foo');
          done();
        });

        request(app.listen())
        .post('/')
        .set('content-type', 'application/json')
        .send('"foo"')
        .end(function(){});
      })
    })

    describe('and strict === true', function(){
      it('should parse', function(done){
        var app = koa();

        app.use(function *(){
          try {
            yield parse.json(this, {strict: true});
          } catch (err) {
            err.status.should.equal(400);
            err.body.should.equal('"foo"');
            err.message.should.equal('invalid JSON, only supports object and array');
            done();
          }
        });

        request(app.listen())
        .post('/')
        .set('content-type', 'application/json')
        .send('"foo"')
        .end(function(){});
      })
    })
  })
})
