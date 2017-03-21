
var request = require('supertest');
var parse = require('..');
var koa = require('koa');

describe('parse.text(req, opts)', function(){
  describe('with valid str', function(){
    it('should parse', function(done){
      var app = koa();

      app.use(function *(){
        this.body = yield parse.text(this);
      });

      request(app.listen())
      .post('/')
      .send('Hello World!')
      .expect(200)
      .expect('Hello World!', done);
    });
  });

  describe('with invalid content encoding', function() {
    it('should throw 415', function(done) {
      var app = koa();

      app.use(function *(){
        var body = yield parse.text(this);
        this.status = 200;
      });

      request(app.listen())
      .post('/')
      .set('content-encoding', 'invalid')
      .send('Hello World!')
      .expect(415, done);
    })
  })

  describe('returnRawBody', function(){
    it('should return raw body when opts.returnRawBody = true', function(done){
      var app = koa();

      app.use(function *(){
        this.body = yield parse.text(this, { returnRawBody: true });
      });

      request(app.listen())
      .post('/')
      .send('Hello World!')
      .expect({ parsed: 'Hello World!', raw: 'Hello World!' })
      .expect(200, done);
    });
  })
});
