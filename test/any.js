
var request = require('supertest');
var parse = require('..');
var koa = require('koa');

describe('parse(req, opts)', function(){
  describe('with valid form body', function(){
    it('should parse', function(done){
      var app = koa();

      app.use(function *(){
        var body = yield parse(this);
        body.foo.bar.should.equal('baz');
        done();
      });

      request(app.listen())
      .post('/')
      .type('form')
      .send({ foo: { bar: 'baz' }})
      .end(function(){});
    })
  })

  describe('with valid json', function(){
    it('should parse', function(done){
      var app = koa();

      app.use(function *(){
        var body = yield parse(this);
        body.should.eql({ foo: 'bar' });
        done();
      });

      request(app.listen())
      .post('/')
      .send({ foo: 'bar' })
      .end(function(){});
    })
  })

  describe('with valid text', function(){
    it('should parse', function(done){
      var app = koa();

      app.use(function *(){
        this.body = yield parse(this);
      });

      request(app.listen())
      .post('/')
      .set('content-type', 'text/plain')
      .send('plain text')
      .expect(200)
      .expect('plain text', done);
    })
  })

  describe('with know json content-type', function(){
    var app = koa();

    app.use(function *(){
      this.body = yield parse(this);
    });

    it('should parse application/json-patch+json', function(done){
      request(app.listen())
      .post('/')
      .type('application/json-patch+json')
      .send(JSON.stringify([{op: 'replace', path: '/foo', value:'bar'}]))
      .expect(200)
      .expect([{op: 'replace', path: '/foo', value:'bar'}], done);
    });

    it('should parse application/vnd.api+json', function(done){
      request(app.listen())
      .post('/')
      .type('application/vnd.api+json')
      .send(JSON.stringify({posts: "1"}))
      .expect(200)
      .expect({posts: "1"}, done);
    });
  });


  describe('with missing content-type', function(){
    it('should fail with 415', function(done){
      var app = koa();

      app.use(function *(){
        yield parse(this);
      });

      request(app.listen())
      .post('/')
      .expect(415, 'Unsupported Media Type', done);
    })
  })
})
