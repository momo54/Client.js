/*! @license ©2014 Ruben Verborgh - Multimedia Lab / iMinds / Ghent University */

// Creates a constructor for an Error with the given name
function createErrorType(name, init) {
  function E(message) {
    this.name = name;
    if (!Error.captureStackTrace)
      this.stack = (new Error()).stack;
    else
      Error.captureStackTrace(this, this.constructor);
    this.message = message;
    init && init.apply(this, arguments);
  }
  E.prototype = new Error();
  E.prototype.name = name;
  E.prototype.constructor = E;
  return E;
}

module.exports = createErrorType;
