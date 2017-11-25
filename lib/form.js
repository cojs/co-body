
/**
 * Module dependencies.
 */

var raw = require('raw-body');
var inflate = require('inflation');
var qs = require('qs');
var utils = require('./utils');

/**
 * Return a Promise which parses x-www-form-urlencoded requests.
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
  var request = utils.normalizeRequest(req);
  var opts = utils.normalizeOptions(request, utils.clone(options), {
    limit:       '56kb',
    qs:          qs,
    queryString: {}
  });

  // keep compatibility with qs@4
  var queryString = opts.queryString;
  if (queryString.allowDots === undefined) queryString.allowDots = true;

  // raw-body returns a Promise when no callback is specified
  return Promise.resolve()
    .then(function() {
      return raw(inflate(request), opts);
    })
    .then(function(str){
      try {
        var parsed = opts.qs.parse(str, queryString);
        return opts.returnRawBody ? { parsed: parsed, raw: str } : parsed;
      } catch (err) {
        err.status = 400;
        err.body = str;
        throw err;
      }
    });
};
