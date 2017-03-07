/**
 * Module dependencies.
 */

var raw = require('raw-body');
var inflate = require('inflation');

/**
 * Return a Promise which parses text/plain requests.
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
  options.limit = options.limit || '1mb';

  // raw-body returns a Promise when no callback is specified
  return raw(inflate(req), options);
};
