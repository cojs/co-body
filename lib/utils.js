
/**
 * Module dependencies.
 */

exports.getOptions = function (opts) {
  opts = opts || {};
  return {
    limit: opts.limit,
    strict: opts.strict,
    queryString: opts.queryString,
    qs: opts.qs,
    returnRawBody: opts.returnRawBody,
    encoding: opts.encoding,
  };
}
