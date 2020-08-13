'use strict';

/**
 * Module dependencies.
 */

exports.clone = function(opts) {
  const options = {};
  opts = opts || {};
  for (const key in opts) {
    options[key] = opts[key];
  }
  return options;
};

exports.CoBodyError = class CoBodyError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
};
