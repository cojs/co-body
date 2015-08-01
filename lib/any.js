
/**
 * Module dependencies.
 */

var typeis = require('type-is')
var json = require('./json');
var form = require('./form');
var text = require('./text');

/**
 * Return a a thunk which parses form and json requests
 * depending on the Content-Type.
 *
 * Pass a node request or an object with `.req`,
 * such as a koa Context.
 *
 * @param {Request} req
 * @param {Options} [opts]
 * @return {Function}
 * @api public
 */

module.exports = function(req, opts){
  req = req.req || req;

  // json
  if (typeis(req, ['json', 'application/*+json', 'application/csp-report'])) return json(req, opts);

  // form
  if (typeis(req, 'urlencoded')) return form(req, opts);

  // text
  if (typeis(req, 'text')) return text(req, opts);

  // invalid
  return function(done){
    var type = req.headers['content-type'] || '';
    var message = type ? 'Unsupported content-type: ' + type : 'Missing content-type';
    var err = new Error(message);
    err.status = 415;
    done(err);
  };
};
