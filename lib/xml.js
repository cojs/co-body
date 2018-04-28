
/**
 * Module dependencies.
 */

var raw = require('raw-body');
var inflate = require('inflation');
var xmlParse = require('xml2js').parseString;
var utils = require('./utils');

/**
 * Return a Promise which parses xml requests.
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
  opts = utils.clone(opts);

  // defaults
  var len = req.headers['content-length'];
  var encoding = req.headers['content-encoding'] || 'identity';
  if (len && encoding === 'identity') opts.length = len = ~~len;
  opts.encoding = opts.encoding || 'utf8';
  opts.limit = opts.limit || '1mb';
  var strict = opts.strict = opts.strict !== false;
  opts.explicitArray = !(opts.explicitArray !== true);

  // raw-body returns a promise when no callback is specified
  return Promise.resolve()
    .then(function() {
      return raw(inflate(req), opts);
    })
    .then(function(str) {
      if (!str && strict) return {};
      return new Promise(function(resolve, reject) {
        xmlParse(str, opts, function(err, parsed) {
          if (err) {
            err.status = 400;
            err.body = str;
            reject(err);
          } else {
            if (parsed === null && strict) {
              parsed = {};
            }
            resolve(opts.returnRawBody ? { parsed: parsed, raw: str } : parsed);
          }
        })
      });
    });
};
