/**
 * Module dependencies.
 */

var raw = require('raw-body');
var inflate = require('inflation');
var utils = require('./utils');

/**
 * Return a Promise which parses text/plain requests.
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

  // raw-body returns a Promise when no callback is specified
  return Promise.resolve()
    .then(function() {
      return raw(inflate(req), opts);
    })
    .then(function(str) {
      // ensure return the same format with json / form
      return opts.returnRawBody ? { parsed: str, raw: str } : str;
    });
};
