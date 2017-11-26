
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
 * @param {Options} [options]
 * @return {Promise<Object>}
 * @api public
 */

module.exports = function(req, options){
  var request = utils.normalizeRequest(req);
  if (options === undefined) {
    options = {};
  }

  // json
  var jsonType = options.jsonTypes !== undefined
               ? options.jsonTypes
               : jsonTypes;
  if (typeis(request, jsonType)) return json(request, options);

  // form
  var formType = options.formTypes !== undefined
               ? options.formTypes
               : formTypes;
  if (typeis(request, formType)) return form(request, options);

  // text
  var textType = options.textTypes !== undefined
               ? options.textTypes
               : textTypes;
  if (typeis(request, textType)) return text(request, options);

  // invalid
  var type = request.headers['content-type'] !== undefined
           ? request.headers['content-type']
           : '';
  var message = type !== '' ? 'Unsupported content-type: ' + type : 'Missing content-type';
  var err = new Error(message);
  err.status = 415;
  return Promise.reject(err);
};
