
/**
 * Module dependencies.
 */

var raw = require('raw-body');
var inflate = require('inflation');
var qs = require('qs');

/**
 * Return a Promise which parses x-www-form-urlencoded requests.
 *
 * Pass a node request or an object with `.req`,
 * such as a koa Context.
 *
 * @param {Request} req
 * @param {Options} [options]
 * @return {Function}
 * @api public
 */

module.exports = function(req, opts){
  req = req.req || req;
  opts = opts || {};
  var options = {
    encoding: opts.encoding,
    limit: opts.limit,
    length: opts.length,
    strict: opts.strict,
    queryString: opts.queryString
  };


  // defaults
  var len = req.headers['content-length'];
  var encoding = req.headers['content-encoding'] || 'identity';
  if (len && encoding === 'identity') options.length = ~~len;
  options.encoding = options.encoding || 'utf8';
  options.limit = options.limit || '56kb';
  options.qs = opts.qs || qs;

  // raw-body returns a Promise when no callback is specified
  return raw(inflate(req), options)
    .then(function(str){
      try {
        return options.qs.parse(str, options.queryString);
      } catch (err) {
        err.status = 400;
        err.body = str;
        throw err;
      }
    });
};
