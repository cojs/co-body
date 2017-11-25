
/**
 * Module dependencies.
 */

var typeis = require('type-is');
var json = require('./json');
var form = require('./form');
var text = require('./text');
var utils = require('./utils');

var jsonTypes = ['json', 'application/*+json', 'application/csp-report'];
var formTypes = ['urlencoded'];
var textTypes = ['text'];

/**
 * Return a Promise which parses form and json requests
 * depending on the Content-Type.
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
  var request = utils.normalizeRequest(req);
  if (opts === undefined) {
    opts = {};
  }

  // json
  var jsonType = opts.jsonTypes !== undefined
               ? opts.jsonTypes
               : jsonTypes;
  if (typeis(request, jsonType)) return json(request, opts);

  // form
  var formType = opts.formTypes !== undefined
               ? opts.formTypes
               : formTypes;
  if (typeis(request, formType)) return form(request, opts);

  // text
  var textType = opts.textTypes !== undefined
               ? opts.textTypes
               : textTypes;
  if (typeis(request, textType)) return text(request, opts);

  // invalid
  var type = request.headers['content-type'] !== undefined
           ? request.headers['content-type']
           : '';
  var message = type !== '' ? 'Unsupported content-type: ' + type : 'Missing content-type';
  var err = new Error(message);
  err.status = 415;
  return Promise.reject(err);
};
