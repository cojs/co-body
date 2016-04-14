
var request = require('supertest');
var parse = require('..');
var koa = require('koa');

describe('parse.form(req, opts)', function(){
  describe('with valid form body', function(){
    it('should parse', function(done){
      var app = koa();

      app.use(function *(){
        var body = yield parse.form(this);
        body.foo.bar.should.equal('baz');
        this.status = 200;
      });

      request(app.listen())
      .post('/')
      .type('form')
      .send({ foo: { bar: 'baz' }})
      .end(function(err){ done(err); });
    })
  })

  describe('with qs settings', function(){
    var data = { level1: { level2: { level3: { level4: { level5: { level6: { level7: 'Hello' } } } } } } };

    it('should not parse full depth', function(done){
      var app = koa();

      app.use(function *(){
        var body = yield parse.form(this);  // default to depth = 5
        body.level1.level2.level3.level4.level5.level6['[level7]'].should.equal('Hello');
        this.status = 200;
      });

      request(app.listen())
      .post('/')
      .type('form')
      .send({ level1: { level2: { level3: { level4: { level5: { level6: { level7: 'Hello' }}}}}}})
      .end(function(err){ done(err); });

    })

    it('should parse', function(done){
      var app = koa();

      app.use(function *(){
        var body = yield parse.form(this, { queryString: { depth: 10 } });
        body.level1.level2.level3.level4.level5.level6.level7.should.equal('Hello');
        this.status = 200;
      });

      request(app.listen())
      .post('/')
      .type('form')
      .send(data)
      .end(function(err){ done(err); });
    })
  })

  describe('with custom qs module', function(){
    it('should parse with safe-qs', function(done){
      var app = koa();

      app.use(function *(){
        try {
          var body = yield parse.form(this, {
            qs: require('safe-qs'),
          });
          throw new Error('should not run this');
        } catch (err) {
          this.status = err.status;
          this.body = err.message;
        }
      });

      request(app.listen())
      .post('/')
      .type('form')
      .send({ a: { '21': 'a' } })
      .expect('Index of array [21] is overstep limit: 20')
      .expect(400, done);
    })
  })
})
