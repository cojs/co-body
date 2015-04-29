
/**
 * Module dependencies.
 */

var raw = require('raw-body');

/**
 * Return a promise which parses json requests.
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
  opts = opts || {};

  // defaults
  var len = req.headers['content-length'];
  if (len) opts.length = len = ~~len;
  opts.encoding = opts.encoding || 'utf8';
  opts.limit = opts.limit || '1mb';

  return new Promise(resolve, reject){
    if (len === 0) return resolve();

    raw(req, opts, function(err, str){
      if (err) return reject(err);

      var parsed;
      try {
        parsed = JSON.parse(str)
      } catch (err) {
        err.status = 400;
        err.body = 'Unable to parse json: ' + err.message;
        return reject(err);
      }
      
      resolve(parsed);
    });
  }
};
