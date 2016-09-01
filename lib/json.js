
/**
 * Module dependencies.
 */

var raw = require('raw-body');
var inflate = require('inflation');

// Allowed whitespace is defined in RFC 7159
// http://www.rfc-editor.org/rfc/rfc7159.txt
var strictJSONReg = /^[\x20\x09\x0a\x0d]*(\[|\{)/;

/**
 * Return a Promise which parses json requests.
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
  if (len && encoding === 'identity') options.length = len = ~~len;
  options.encoding = options.encoding || 'utf8';
  options.limit = options.limit || '1mb';
  var strict = options.strict !== false;

  // raw-body returns a promise when no callback is specified
  return raw(inflate(req), options)
    .then(function(str) {
      try {
        return parse(str);
      } catch (err) {
        err.status = 400;
        err.body = str;
        throw err;
      }
    });

  function parse(str){
    if (!strict) return str ? JSON.parse(str) : str;
    // strict mode always return object
    if (!str) return {};
    // strict JSON test
    if (!strictJSONReg.test(str)) {
      throw new Error('invalid JSON, only supports object and array');
    }
    return JSON.parse(str);
  }
};
