"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectAssign = _interopRequireDefault(require("object-assign"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var STATUS_ENUM = Object.freeze({
  PENDING: 0,
  FULFILLED: 1,
  REJECTED: -1
});

var nextTick = function nextTick(cb) {
  if ((typeof process === "undefined" ? "undefined" : _typeof(process)) === 'object' && typeof process.nextTick == 'function') {
    return process.nextTick(cb);
  } else if (typeof setImmediate === 'function') {
    return setImmediate(cb);
  }

  return function (cb) {
    setTimeout(cb, 0);
  };
};

var isPromise = function isPromise(value) {
  return value instanceof PromiseLet;
};

var isObject = function isObject(obj) {
  return obj && _typeof(obj) === 'object';
};

var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
/**
 * @param {STATUS_ENUM} targetStatus
 * @param {string} target.value fulfilled value
 * @param {string} target.reason rejected reason
 */


function transition(targetStatus, target) {
  var status = this.state.status;

  if (status !== STATUS_ENUM.PENDING) {
    return;
  }

  (0, _objectAssign.default)(this.state, {
    status: targetStatus
  }, target);
  processChain.call(this, target);
}
/**
 * @param {string} target.value fulfilled value
 * @param {string} target.reason rejected reason
 */


function processChain(target) {
  var _this = this;

  var _this$state = this.state,
      chain = _this$state.chain,
      status = _this$state.status;
  chain.forEach(function (_ref) {
    var onFulfilled = _ref.onFulfilled,
        onRejected = _ref.onRejected;

    if (status === STATUS_ENUM.FULFILLED) {
      onFulfilled.call(_this, target.value);
    } else if (status === STATUS_ENUM.REJECTED) {
      onRejected.call(_this, target.reason);
    }
  });
}

function onFulfilled(value) {
  var _this2 = this;

  var called = false;

  if (value === this) {
    throw new TypeError('Chaining cycle detected for promise');
  }

  if (isPromise(value)) {
    value.then(function (value2) {
      if (!called) {
        called = true;
        onFulfilled.call(_this2, value2);
      }
    }, function (reason) {
      if (!called) {
        called = true;
        onRejected.call(_this2, reason);
      }
    });
  } else if (isObject(value) || isFunction(value)) {
    try {
      var then = value.then;

      if (isFunction(then)) {
        then.call(value, function (value2) {
          if (!called) {
            called = true;
            onFulfilled.call(_this2, value2);
          }
        }, function (reason) {
          if (!called) {
            called = true;
            onRejected.call(_this2, reason);
          }
        });
      } else {
        transition.call(this, STATUS_ENUM.FULFILLED, {
          value: value
        });
      }
    } catch (e) {
      if (!called) {
        called = true;
        onRejected.call(this, e);
      }
    }
  } else {
    transition.call(this, STATUS_ENUM.FULFILLED, {
      value: value
    });
  }
}

function onRejected(reason) {
  var status = this.state.status;

  if (status !== STATUS_ENUM.PENDING) {
    return;
  }

  transition.call(this, STATUS_ENUM.REJECTED, {
    reason: reason
  });
}

var PromiseLet =
/*#__PURE__*/
function () {
  function PromiseLet(cb) {
    _classCallCheck(this, PromiseLet);

    this.state = {
      status: STATUS_ENUM.PENDING,
      chain: [],
      value: undefined,
      reason: undefined
    };
    cb(onFulfilled.bind(this), onRejected.bind(this));
  }

  _createClass(PromiseLet, [{
    key: "then",
    value: function then(_onFulfilled, _onRejected) {
      var _this$state2 = this.state,
          status = _this$state2.status,
          chain = _this$state2.chain,
          value = _this$state2.value,
          reason = _this$state2.reason;
      return new PromiseLet(function (onFulfilled2, onRejected2) {
        var chainObj = {
          onFulfilled: function onFulfilled(value) {
            nextTick(function () {
              try {
                if (typeof _onFulfilled === 'function') {
                  onFulfilled2(_onFulfilled(value));
                } else {
                  onFulfilled2(value);
                }
              } catch (e) {
                onRejected2(e);
              }
            });
          },
          onRejected: function onRejected(reason) {
            nextTick(function () {
              try {
                if (typeof _onRejected === 'function') {
                  onFulfilled2(_onRejected(reason));
                } else {
                  onRejected2(reason);
                }
              } catch (e) {
                onRejected2(e);
              }
            });
          }
        };

        if (status === STATUS_ENUM.FULFILLED) {
          chainObj.onFulfilled(value);
        } else if (status === STATUS_ENUM.REJECTED) {
          chainObj.onRejected(reason);
        } else {
          chain.push(chainObj);
        }
      });
    }
  }, {
    key: "catch",
    value: function _catch(onRejected) {
      this.then(null, onRejected);
    }
  }, {
    key: "finally",
    value: function _finally() {}
  }], [{
    key: "all",
    value: function all() {}
  }, {
    key: "race",
    value: function race() {}
  }, {
    key: "resolve",
    value: function resolve() {}
  }, {
    key: "reject",
    value: function reject() {}
  }]);

  return PromiseLet;
}();

var _default = PromiseLet;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIlNUQVRVU19FTlVNIiwiT2JqZWN0IiwiZnJlZXplIiwiUEVORElORyIsIkZVTEZJTExFRCIsIlJFSkVDVEVEIiwibmV4dFRpY2siLCJjYiIsInByb2Nlc3MiLCJzZXRJbW1lZGlhdGUiLCJzZXRUaW1lb3V0IiwiaXNQcm9taXNlIiwidmFsdWUiLCJQcm9taXNlTGV0IiwiaXNPYmplY3QiLCJvYmoiLCJpc0Z1bmN0aW9uIiwidHJhbnNpdGlvbiIsInRhcmdldFN0YXR1cyIsInRhcmdldCIsInN0YXR1cyIsInN0YXRlIiwicHJvY2Vzc0NoYWluIiwiY2FsbCIsImNoYWluIiwiZm9yRWFjaCIsIm9uRnVsZmlsbGVkIiwib25SZWplY3RlZCIsInJlYXNvbiIsImNhbGxlZCIsIlR5cGVFcnJvciIsInRoZW4iLCJ2YWx1ZTIiLCJlIiwidW5kZWZpbmVkIiwiYmluZCIsIm9uRnVsZmlsbGVkMiIsIm9uUmVqZWN0ZWQyIiwiY2hhaW5PYmoiLCJwdXNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLFdBQVcsR0FBR0MsTUFBTSxDQUFDQyxNQUFQLENBQWM7QUFDaENDLEVBQUFBLE9BQU8sRUFBRSxDQUR1QjtBQUVoQ0MsRUFBQUEsU0FBUyxFQUFFLENBRnFCO0FBR2hDQyxFQUFBQSxRQUFRLEVBQUUsQ0FBQztBQUhxQixDQUFkLENBQXBCOztBQU1BLElBQU1DLFFBQVEsR0FBRyxTQUFYQSxRQUFXLENBQUNDLEVBQUQsRUFBUTtBQUN2QixNQUFJLFFBQU9DLE9BQVAseUNBQU9BLE9BQVAsT0FBbUIsUUFBbkIsSUFDSixPQUFPQSxPQUFPLENBQUNGLFFBQWYsSUFBMkIsVUFEM0IsRUFDdUM7QUFDckMsV0FBT0UsT0FBTyxDQUFDRixRQUFSLENBQWlCQyxFQUFqQixDQUFQO0FBQ0QsR0FIRCxNQUdPLElBQUksT0FBT0UsWUFBUCxLQUF3QixVQUE1QixFQUF3QztBQUM3QyxXQUFPQSxZQUFZLENB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cm9tICdvYmplY3QtYXNzaWduJztcblxuY29uc3QgU1RBVFVTX0VOVU0gPSBPYmplY3QuZnJlZXplKHtcbiAgUEVORElORzogMCxcbiAgRlVMRklMTEVEOiAxLFxuICBSRUpFQ1RFRDogLTEsXG59KTtcblxuY29uc3QgbmV4dFRpY2sgPSAoY2IpID0+IHtcbiAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJlxuICB0eXBlb2YgcHJvY2Vzcy5uZXh0VGljayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MubmV4dFRpY2soY2IpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gc2V0SW1tZWRpYXRlKGNiKTtcbiAgfVxuICByZXR1cm4gKGNiKSA9PiB7XG4gICAgc2V0VGltZW91dChjYiwgMCk7XG4gIH07XG59O1xuXG5jb25zdCBpc1Byb21pc2UgPSAodmFsdWUpID0+IHtcbiAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZUxldDtcbn07XG5jb25zdCBpc09iamVjdCA9IChvYmopID0+IHtcbiAgcmV0dXJuIG9iaiAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jztcbn07XG5jb25zdCBpc0Z1bmN0aW9uID0gKHZhbHVlKSA9PiB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59O1xuXG5cbi8qKlxuICogQHBhcmFtIHtTVEFUVVNfRU5VTX0gdGFyZ2V0U3RhdHVzXG4gKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0LnZhbHVlIGZ1bGZpbGxlZCB2YWx1ZVxuICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldC5yZWFzb24gcmVqZWN0ZWQgcmVhc29uXG4gKi9cbmZ1bmN0aW9uIHRyYW5zaXRpb24odGFyZ2V0U3RhdHVzLCB0YXJnZXQpIHtcbiAgY29uc3Qge1xuICAgIHN0YXR1cyxcbiAgfSA9IHRoaXMuc3RhdGU7XG4gIGlmIChzdGF0dXMgIT09IFNUQVRVU19FTlVNLlBFTkRJTkcpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgYXNzaWduKHRoaXMuc3RhdGUsIHtcbiAgICBzdGF0dXM6IHRhcmdldFN0YXR1cyxcbiAgfSwgdGFyZ2V0KTtcbiAgcHJvY2Vzc0NoYWluLmNhbGwodGhpcywgdGFyZ2V0KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0LnZhbHVlIGZ1bGZpbGxlZCB2YWx1ZVxuICogQHBhcmFtIHtzdHJpbmd9IHRhcmdldC5yZWFzb24gcmVqZWN0ZWQgcmVhc29uXG4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NDaGFpbih0YXJnZXQpIHtcbiAgY29uc3Qge1xuICAgIGNoYWluLFxuICAgIHN0YXR1cyxcbiAgfSA9IHRoaXMuc3RhdGU7XG4gIGNoYWluLmZvckVhY2goKHsgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQgfSkgPT4ge1xuICAgIGlmIChzdGF0dXMgPT09IFNUQVRVU19FTlVNLkZVTEZJTExFRCkge1xuICAgICAgb25GdWxmaWxsZWQuY2FsbCh0aGlzLCB0YXJnZXQudmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoc3RhdHVzID09PSBTVEFUVVNfRU5VTS5SRUpFQ1RFRCkge1xuICAgICAgb25SZWplY3RlZC5jYWxsKHRoaXMsIHRhcmdldC5yZWFzb24pO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG9uRnVsZmlsbGVkKHZhbHVlKSB7XG4gIGxldCBjYWxsZWQgPSBmYWxzZTtcbiAgaWYgKHZhbHVlID09PSB0aGlzKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2hhaW5pbmcgY3ljbGUgZGV0ZWN0ZWQgZm9yIHByb21pc2UnKTtcbiAgfVxuICBpZiAoaXNQcm9taXNlKHZhbHVlKSkge1xuICAgIHZhbHVlLnRoZW4oKHZhbHVlMikgPT4ge1xuICAgICAgaWYgKCFjYWxsZWQpIHtcbiAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgb25GdWxmaWxsZWQuY2FsbCh0aGlzLCB2YWx1ZTIpO1xuICAgICAgfVxuICAgIH0sIChyZWFzb24pID0+IHtcbiAgICAgIGlmICghY2FsbGVkKSB7XG4gICAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICAgIG9uUmVqZWN0ZWQuY2FsbCh0aGlzLCByZWFzb24pO1xuICAgICAgfVxuICAgIH0pO1xuICB9IGVsc2UgaWYgKGlzT2JqZWN0KHZhbHVlKSB8fCBpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB0aGVuID0gdmFsdWUudGhlbjtcbiAgICAgIGlmIChpc0Z1bmN0aW9uKHRoZW4pKSB7XG4gICAgICAgIHRoZW4uY2FsbCh2YWx1ZSwgKHZhbHVlMikgPT4ge1xuICAgICAgICAgIGlmICghY2FsbGVkKSB7XG4gICAgICAgICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgb25GdWxmaWxsZWQuY2FsbCh0aGlzLCB2YWx1ZTIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgKHJlYXNvbikgPT4ge1xuICAgICAgICAgIGlmICghY2FsbGVkKSB7XG4gICAgICAgICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgICAgICAgb25SZWplY3RlZC5jYWxsKHRoaXMsIHJlYXNvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRyYW5zaXRpb24uY2FsbCh0aGlzLCBTVEFUVVNfRU5VTS5GVUxGSUxMRUQsIHsgdmFsdWUgfSk7XG4gICAgICB9XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBpZiAoIWNhbGxlZCkge1xuICAgICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgICBvblJlamVjdGVkLmNhbGwodGhpcywgZSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRyYW5zaXRpb24uY2FsbCh0aGlzLCBTVEFUVVNfRU5VTS5GVUxGSUxMRUQsIHsgdmFsdWUgfSk7XG4gIH1cbn1cbmZ1bmN0aW9uIG9uUmVqZWN0ZWQocmVhc29uKSB7XG4gIGNvbnN0IHtcbiAgICBzdGF0dXMsXG4gIH0gPSB0aGlzLnN0YXRlO1xuICBpZiAoc3RhdHVzICE9PSBTVEFUVVNfRU5VTS5QRU5ESU5HKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRyYW5zaXRpb24uY2FsbCh0aGlzLCBTVEFUVVNfRU5VTS5SRUpFQ1RFRCwgeyByZWFzb24gfSk7XG59XG5jbGFzcyBQcm9taXNlTGV0IHtcbiAgY29uc3RydWN0b3IoY2IpIHtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgc3RhdHVzOiBTVEFUVVNfRU5VTS5QRU5ESU5HLFxuICAgICAgY2hhaW46IFtdLFxuICAgICAgdmFsdWU6IHVuZGVmaW5lZCxcbiAgICAgIHJlYXNvbjogdW5kZWZpbmVkLFxuICAgIH07XG4gICAgY2Iob25GdWxmaWxsZWQuYmluZCh0aGlzKSwgb25SZWplY3RlZC5iaW5kKHRoaXMpKTtcbiAgfVxuICBzdGF0aWMgYWxsKCkge1xuXG4gIH1cbiAgc3RhdGljIHJhY2UoKSB7XG5cbiAgfVxuICBzdGF0aWMgcmVzb2x2ZSgpIHtcblxuICB9XG4gIHN0YXRpYyByZWplY3QoKSB7XG5cbiAgfVxuICB0aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gICAgY29uc3Qge1xuICAgICAgc3RhdHVzLFxuICAgICAgY2hhaW4sXG4gICAgICB2YWx1ZSxcbiAgICAgIHJlYXNvbixcbiAgICB9ID0gdGhpcy5zdGF0ZTtcbiAgICByZXR1cm4gbmV3IFByb21pc2VMZXQoKG9uRnVsZmlsbGVkMiwgb25SZWplY3RlZDIpID0+IHtcbiAgICAgIGNvbnN0IGNoYWluT2JqID0ge1xuICAgICAgICBvbkZ1bGZpbGxlZCh2YWx1ZSkge1xuICAgICAgICAgIG5leHRUaWNrKCgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2Ygb25GdWxmaWxsZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBvbkZ1bGZpbGxlZDIob25GdWxmaWxsZWQodmFsdWUpKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvbkZ1bGZpbGxlZDIodmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgIG9uUmVqZWN0ZWQyKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBvblJlamVjdGVkKHJlYXNvbikge1xuICAgICAgICAgIG5leHRUaWNrKCgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2Ygb25SZWplY3RlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIG9uRnVsZmlsbGVkMihvblJlamVjdGVkKHJlYXNvbikpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9uUmVqZWN0ZWQyKHJlYXNvbik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgb25SZWplY3RlZDIoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgICAgaWYgKHN0YXR1cyA9PT0gU1RBVFVTX0VOVU0uRlVMRklMTEVEKSB7XG4gICAgICAgIGNoYWluT2JqLm9uRnVsZmlsbGVkKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoc3RhdHVzID09PSBTVEFUVVNfRU5VTS5SRUpFQ1RFRCkge1xuICAgICAgICBjaGFpbk9iai5vblJlamVjdGVkKHJlYXNvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaGFpbi5wdXNoKGNoYWluT2JqKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBjYXRjaChvblJlamVjdGVkKSB7XG4gICAgdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0ZWQpO1xuICB9XG4gIGZpbmFsbHkoKSB7XG5cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQcm9taXNlTGV0O1xuIl0sImZpbGUiOiJpbmRleC5qcyJ9
