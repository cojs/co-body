
var request = require('supertest');
var parse = require('..');
var koa = require('koa');
var co = require('co');

describe('parse(req, opts)', function(){
  describe('with valid str', function(){
    it('should echo', function(done){
      var app = koa();

      app.use(function *(){
        var body = yield this;
        body.should.eql('Hello World!');
        done();
      });

      request(app.listen())
      .post('/')
      .send('Hello World!')
      .end(function(){});
    })
  })
})