import assign from 'object-assign';

const STATUS_ENUM = Object.freeze({
  PENDING: 0,
  FULFILLED: 1,
  REJECTED: -1,
});

const nextTick = (cb) => {
  if (typeof process === 'object' &&
  typeof process.nextTick == 'function') {
    return process.nextTick(cb);
  } else if (typeof setImmediate === 'function') {
    return setImmediate(cb);
  }
  return (cb) => {
    setTimeout(cb, 0);
  };
};

const isPromise = (value) => {
  return value instanceof PromiseLet;
};
const isObject = (obj) => {
  return obj && typeof obj === 'object';
};
const isFunction = (value) => {
  return typeof value === 'function';
};


/**
 * @param {STATUS_ENUM} targetStatus
 * @param {string} target.value fulfilled value
 * @param {string} target.reason rejected reason
 */
function transition(targetStatus, target) {
  const {
    status,
  } = this.state;
  if (status !== STATUS_ENUM.PENDING) {
    return;
  }
  assign(this.state, {
    status: targetStatus,
  }, target);
  processChain.call(this, target);
}

/**
 * @param {string} target.value fulfilled value
 * @param {string} target.reason rejected reason
 */
function processChain(target) {
  const {
    chain,
    status,
  } = this.state;
  chain.forEach(({ onFulfilled, onRejected }) => {
    if (status === STATUS_ENUM.FULFILLED) {
      onFulfilled.call(this, target.value);
    } else if (status === STATUS_ENUM.REJECTED) {
      onRejected.call(this, target.reason);
    }
  });
}

function onFulfilled(value) {
  let called = false;
  if (value === this) {
    throw new TypeError('Chaining cycle detected for promise');
  }
  if (isPromise(value)) {
    value.then((value2) => {
      if (!called) {
        called = true;
        onFulfilled.call(this, value2);
      }
    }, (reason) => {
      if (!called) {
        called = true;
        onRejected.call(this, reason);
      }
    });
  } else if (isObject(value) || isFunction(value)) {
    try {
      const then = value.then;
      if (isFunction(then)) {
        then.call(value, (value2) => {
          if (!called) {
            called = true;
            onFulfilled.call(this, value2);
          }
        }, (reason) => {
          if (!called) {
            called = true;
            onRejected.call(this, reason);
          }
        });
      } else {
        transition.call(this, STATUS_ENUM.FULFILLED, { value });
      }
    } catch(e) {
      if (!called) {
        called = true;
        onRejected.call(this, e);
      }
    }
  } else {
    transition.call(this, STATUS_ENUM.FULFILLED, { value });
  }
}
function onRejected(reason) {
  const {
    status,
  } = this.state;
  if (status !== STATUS_ENUM.PENDING) {
    return;
  }
  transition.call(this, STATUS_ENUM.REJECTED, { reason });
}
class PromiseLet {
  constructor(cb) {
    if (typeof cb !== 'function') {
      throw new TypeError(`Promise resolver ${cb} is not a function`);
    }
    this.state = {
      status: STATUS_ENUM.PENDING,
      chain: [],
      value: undefined,
      reason: undefined,
    };
    cb(onFulfilled.bind(this), onRejected.bind(this));
  }
  static all(...args) {
    let resolveCount = 0;
    let result = [];
    return new PromiseLet((resolve, reject) => {
      args.forEach((promise, index) => {
        promise.then((value) => {
          resolveCount++;
          result[index] = value;
          if (resolveCount === args.length) {
            resolve(result);
          }
        }, reject);
      });

    });
  }
  static race(...args) {
    return new PromiseLet((resolve, reject) => {
      args.forEach((promise) => {
        promise.then(resolve, reject);
      });
    });
  }
  static resolve(value) {
    if (isPromise(value)) {
      return value;
    }
    return new PromiseLet((resolve) => resolve(value));
  }
  static reject(reason) {
    if (isPromise(reason)) {
      return reason;
    }
    return new PromiseLet((resolve, reject) => reject(reason));
  }
  then(onFulfilled, onRejected) {
    const {
      status,
      chain,
      value,
      reason,
    } = this.state;
    return new PromiseLet((onFulfilled2, onRejected2) => {
      const chainObj = {
        onFulfilled(value) {
          nextTick(() => {
            try {
              if (typeof onFulfilled === 'function') {
                onFulfilled2(onFulfilled(value));
              } else {
                onFulfilled2(value);
              }
            } catch (e) {
              onRejected2(e);
            }
          });
        },
        onRejected(reason) {
          nextTick(() => {
            try {
              if (typeof onRejected === 'function') {
                onFulfilled2(onRejected(reason));
              } else {
                onRejected2(reason);
              }
            } catch (e) {
              onRejected2(e);
            }
          });
        },
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
  catch(onRejected) {
    this.then(null, onRejected);
  }
  finally(cb) {
    return this.then(cb, cb);
  }
}

export default PromiseLet;
