
/**
 * Module dependencies.
 */

exports.clone = function (opts) {
  if (opts === undefined) {
    return {};
  }

  var options = {};
  var index = -1;
  var keys = Object.keys(opts);
  var length = keys.length;

  while (++index < length) {
    var key = keys[index];

    options[key] = opts[key];
  }

  return options;
}

exports.normalizeOptions = function (req, opts, defaults) {
  var len = req.headers['content-length'] !== undefined
          ? ~~req.headers['content-length']
          : 0;
  var encoding = req.headers['content-encoding'] !== undefined
               ? req.headers['content-encoding']
               : 'identity';

  if (len !== 0 && encoding === 'identity') opts.length = ~~len;

  opts.encoding = opts.encoding !== undefined
                ? opts.encoding
                : 'utf8';

  opts.limit    = opts.limit !== undefined
                ? opts.limit
                : defaults.limit;

  return opts;
}
