
var request = require('supertest');
var parse = require('..');
var koa = require('koa');

describe('parse.xml(req, opts)', function(){
  describe('with valid xml', function(){
    it('should parse', function(done){
      var app = koa();

      app.use(function *(){
        var body = yield parse.xml(this);
        body.should.eql({ foo: 'bar' });
        done();
      });

      request(app.listen())
      .post('/')
      .set('content-type', 'application/xml')
      .send('<foo>bar</foo>')
      .end(function(){});
    })
  })

  describe('with invalid content encoding', function() {
    it('should throw 415', function(done) {
      var app = koa();

      app.use(function *(){
        var body = yield parse.xml(this);
        body.foo.bar.should.equal('baz');
        this.status = 200;
      });

      request(app.listen())
      .post('/')
      .type('xml')
      .set('content-encoding', 'invalid')
      .send('<foo><bar>baz</bar></foo>')
      .expect(415, done);
    })
  })

  describe('with content-length zero', function(){
    describe('and strict === false', function(){
      it('should return null', function(done) {
        var app = koa();

        app.use(function *() {
          var body = yield parse.xml(this, {strict: false});
          console.log('body = ', body);
          // body.should.eql(null);
          should(body).be.exactly(null);
          done();
        });
        request(app.listen())
        .post('/')
        .set('content-type', 'application/xml')
        .set('content-length', 0)
        .end(function(){});
      })
    })

    describe('and strict === true', function(){
      it('should return null', function(done) {
        var app = koa();

        app.use(function *() {
          var body = yield parse.xml(this);
          body.should.eql({});
          done();
        });
        request(app.listen())
        .post('/')
        .set('content-type', 'application/xml')
        .set('content-length', 0)
        .end(function(){});
      })
    })
  })

  describe('with invalid xml', function(){
    it('should parse error', function(done){
      var app = koa();

      app.use(function *(){
        try {
          yield parse.xml(this);
        } catch (err) {
          err.status.should.equal(400);
          err.body.should.equal('<foo><bar>baz</bar></foo');
          done();
        }
      });

      request(app.listen())
      .post('/')
      .set('content-type', 'application/xml')
      .send('<foo><bar>baz</bar></foo')
      .end(function(){});
    })
  })

  describe('with non-object xml', function(){
    describe('and strict === true', function(){
      it('should parse', function(done){
        var app = koa();

        app.use(function *(){
          try {
            yield parse.xml(this);
          } catch (err) {
            err.status.should.equal(400);
            err.body.should.equal('"foo"');
            console.log(err.message);
            done();
          }
        });

        request(app.listen())
        .post('/')
        .set('content-type', 'application/xml')
        .send('"foo"')
        .end(function(){});
      })
    })
  })

  describe('returnRawBody', function(){
    it('should return raw body when opts.returnRawBody = true', function(done){
      var app = koa();

      app.use(function *(){
        this.body = yield parse.xml(this, { returnRawBody: true });
      });

      request(app.listen())
      .post('/')
      .type('xml')
      .set('content-type', 'application/xml')
      .send("<foo>bar</foo>")
      .expect({ parsed: { foo: 'bar' }, raw: '<foo>bar</foo>' })
      .expect(200, done);
    });
  })
})
