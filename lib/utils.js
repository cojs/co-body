
/**
 * Module dependencies.
 */

var clone = exports.clone = function (opts) {
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

var defaultValues = exports.defaultValues = function (target, source) {
  if (source === undefined) {
    return target;
  }

  if (target === undefined) {
    return clone(source);
  }

  var index = -1;
  var keys = Object.keys(source);
  var length = keys.length;

  while (++index < length) {
    var key = keys[index];

    if (target[key] === undefined) {
      target[key] = source[key];
    }
  }

  return target;
}

var normalizeReq = exports.normalizeRequest = function (req) {
  if (req === undefined) return undefined;
  if (req.req === undefined) return req;
  return req.req;
}

var normalizeOptions = exports.normalizeOptions = function (req, opts, defaults) {
  var len = req.headers['content-length'] !== undefined
          ? ~~req.headers['content-length']
          : 0;

  var encoding = req.headers['content-encoding'] !== undefined
               ? req.headers['content-encoding']
               : 'identity';

  if (len !== 0 && encoding === 'identity') opts.length = ~~len;

  defaultValues(opts, {
    encoding: 'utf8'
  });

  defaultValues(opts, defaults);

  return opts;
}
