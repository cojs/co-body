
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

  describe('with verify', function(){
    describe('and verify pass', function(){
      it('should parse', function(done){
        var app = koa();

        app.use(function *(){
          this.body = yield parse.text(this, {
            verify: function(req, str) {
              str.should.equal('Hello World!');
            }
          });
        });

        request(app.listen())
        .post('/')
        .send('Hello World!')
        .expect(200)
        .expect('Hello World!', done);
      })
    })

    describe('and verify fail', function(){
      it('should not parse', function(done){
        var app = koa();

        app.use(function *(){
          try {
            yield parse.text(this, {
              verify: function(req, str) {
                throw new Error('verify fail');
              }
            });
          } catch(err) {
            err.status.should.equal(403);
            err.body.should.equal('Hello World!');
            done();
          }
        });

        request(app.listen())
        .post('/')
        .send('Hello World!')
        .end(function(){});
      });
    })
  })
})
