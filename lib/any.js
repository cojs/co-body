
/**
 * Module dependencies.
 */

var json = require('./json');
var form = require('./form');
var text = require('./text');

var JSON_CONTENT_TYPES = [
  'application/json',
  'application/json-patch+json',
  'application/vnd.api+json',
  'application/csp-report',
  'application/ld+json'
];

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

  // parse Content-Type
  var type = req.headers['content-type'] || '';
  type = type.split(';')[0];

  // json
  if (~JSON_CONTENT_TYPES.indexOf(type)) return json(req, opts);

  // form
  if ('application/x-www-form-urlencoded' == type) return form(req, opts);

  // text
  if ('text/plain' == type) return text(req, opts);

  // invalid
  return function(done){
    var message = type ? 'Unsupported content-type: ' + type : 'Missing content-type';
    var err = new Error(message);
    err.status = 415;
    done(err);
  };
};
