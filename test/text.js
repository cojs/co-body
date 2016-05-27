
var clone = require('clone');
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

    it('should not modify input opts', function(done){
      var app = koa();

      app.on('error', done);

      app.use(function *() {
        var opts = {};
        var optsCopy = clone(opts);
        yield parse.text(this, opts);
        opts.should.eql(optsCopy);
        done();
      });

      request(app.listen())
      .post('/')
      .send('Hello World!')
      .end(function(){});
    });
  });
});
