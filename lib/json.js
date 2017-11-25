
/**
 * Module dependencies.
 */

var raw = require('raw-body');
var inflate = require('inflation');
var utils = require('./utils');

// Allowed whitespace is defined in RFC 7159
// http://www.rfc-editor.org/rfc/rfc7159.txt
var strictJSONReg = /^[\x20\x09\x0a\x0d]*(\[|\{)/;

function parse(str, strict){
  if (!strict) return str ? JSON.parse(str) : str;
  // strict mode always return object
  if (!str) return {};
  // strict JSON test
  if (!strictJSONReg.test(str)) {
    throw new Error('invalid JSON, only supports object and array');
  }
  return JSON.parse(str);
}

/**
 * Return a Promise which parses json requests.
 *
 * Pass a node request or an object with `.req`,
 * such as a koa Context.
 *
 * @param {Request} req
 * @param {Options} [opts]
 * @return {Function}
 * @api public
 */

module.exports = function(req, options){
  if (req !== undefined && req.req !== undefined) {
    req = req.req;
  }

  var opts = utils.normalizeOptions(req, utils.clone(options), {
    limit: '1mb'
  });

  // defaults
  var strict = opts.strict !== false;

  // raw-body returns a promise when no callback is specified
  return Promise.resolve()
    .then(function() {
      return raw(inflate(req), opts);
    })
    .then(function(str) {
      try {
        var parsed = parse(str, strict);
        return opts.returnRawBody ? { parsed: parsed, raw: str } : parsed;
      } catch (err) {
        err.status = 400;
        err.body = str;
        throw err;
      }
    });
};
