
var request = require('supertest');
var parse = require('..');
var koa = require('koa');
var zlib = require('zlib');

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

    it('should parse application/csp-report', function(done){
      request(app.listen())
      .post('/')
      .type('application/csp-report')
      .send(JSON.stringify({posts: "1"}))
      .expect(200)
      .expect({posts: "1"}, done);
    });

    it('should parse application/ld+json', function(done){
      request(app.listen())
      .post('/')
      .type('application/ld+json')
      .send(JSON.stringify({posts: "1"}))
      .expect(200)
      .expect({posts: "1"}, done);
    });
  });

  describe('with custom types', function(){
    it('should parse html as text', function(done){
      var app = koa();

      app.use(function *(){
        var body = yield parse(this, { textTypes: 'text/html' });
        this.body = body
      });

      request(app.listen())
      .post('/')
      .set('Content-Type', 'text/html')
      .send('<h1>html text</ht>')
      .expect('<h1>html text</ht>', done);
    })

    it('should parse graphql as text', function(done){
      var app = koa();

      app.use(function *(){
        var body = yield parse(this, { textTypes: ['application/graphql', 'text/html'] });
        this.body = body
      });

      var graphql = '{\n  user(id: 4) {\n    name\n  }\n}'

      request(app.listen())
      .post('/')
      .set('Content-Type', 'application/graphql')
      .send(graphql)
      .expect(graphql, done);
    })
  })

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

  describe('with content-encoding', function(){
    it('should inflate gzip', function(done){
      var app = koa();
      var json = JSON.stringify({ foo: 'bar' });

      app.use(function *(){
        var body = yield parse(this);
        body.should.eql({ foo: 'bar' });
        done();
      });

      var req = request(app.listen())
        .post('/')
        .type('json')
        .set('Content-Encoding', 'gzip');
      req.write(zlib.gzipSync(json));
      req.end(function(){});
    })
    it('should inflate deflate', function(done){
      var app = koa();
      var json = JSON.stringify({ foo: 'bar' });

      app.use(function *(){
        var body = yield parse(this);
        body.should.eql({ foo: 'bar' });
        done();
      });

      var req = request(app.listen())
        .post('/')
        .type('json')
        .set('Content-Encoding', 'deflate');
      req.write(zlib.deflateSync(json));
      req.end(function(){});
    })

    describe("after indentity and with shared options", function () {
      var app = koa();
      var options = {};
      app.use(function *(){
        console.log(options);
        this.body = yield parse(this, options);
      });

      before(function(done) {
        request(app.listen())
            .post('/')
            .set('Content-Encoding', 'identity')
            .send({ foo: 'bar', and: 'something extra' })
            .expect(200, done);
      });
      it('should inflate deflate', function(done){

        var json = JSON.stringify({ foo: 'bar' });

        var req = request(app.listen())
            .post('/')
            .type('json')
            .set('Content-Encoding', 'deflate');
        req.write(zlib.deflateSync(json));
        req.expect(200, done);
      })
    });

    it('should pass-through identity', function(done){
      var app = koa();

      app.use(function *(){
        var body = yield parse(this);
        body.should.eql({ foo: 'bar' });
        done();
      });

      request(app.listen())
      .post('/')
      .set('Content-Encoding', 'identity')
      .send({ foo: 'bar' })
      .end(function(){});
    })
  })

})
