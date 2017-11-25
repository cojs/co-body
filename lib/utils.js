
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
