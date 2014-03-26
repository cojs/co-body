
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
});
