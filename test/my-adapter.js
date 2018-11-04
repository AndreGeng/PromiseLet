var PromiseLet = require('../dist/index.js').default;

module.exports = {
  resolve: function(value) {
    return new PromiseLet(function(resolve) {
      resolve(value);
    });
  },
  reject: function(reason) {
    return new PromiseLet(function (resolve, reject) {
      reject(reason);
    });
  },
  deferred: function() {
    var resolve, reject;
    return {
      promise: new PromiseLet(function (_resolve, _reject) {
        resolve = _resolve;
        reject = _reject;
      }),
      resolve: resolve,
      reject: reject,
    };
  },
};
