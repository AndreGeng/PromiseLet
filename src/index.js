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
  chain.forEach(({ onFulfilled, onRejected }) => nextTick(() => {
    if (status === STATUS_ENUM.FULFILLED) {
      onFulfilled.call(this, target.value);
    } else if (status === STATUS_ENUM.REJECTED) {
      onRejected.call(this, target.reason);
    }
  }));
}

function onFulfilled(value) {
  if (value === this) {
    throw new TypeError('Chaining cycle detected for promise');
  }
  if (isPromise(value)) {
    return value.then(onFulfilled.bind(this), onRejected.bind(this));
  } else if (typeof value === 'object' || typeof value == 'function') {
    if (typeof value.then !== 'function') {
      return transition.call(this, STATUS_ENUM.FULFILLED, { value });
    }
    try {
      value.then(onFulfilled.bind(this), onRejected.bind(this));
    } catch (e) {
      onRejected.call(this, e);
    }
  }
  return transition.call(this, STATUS_ENUM.FULFILLED, { value });
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
    this.state = {
      status: STATUS_ENUM.PENDING,
      chain: [],
      value: undefined,
      reason: undefined,
    };
    cb(onFulfilled.bind(this), onRejected.bind(this));
  }
  static all() {

  }
  static race() {

  }
  static resolve() {

  }
  static reject() {

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
          try {
            if (typeof onFulfilled === 'function') {
              onFulfilled2(onFulfilled(value));
            }
            onFulfilled2(value);
          } catch (e) {
            onRejected2(e);
          }
        },
        onRejected(reason) {
          try {
            if (typeof onRejected === 'function') {
              onFulfilled2(onRejected(reason));
            }
            onRejected2(reason);
          } catch (e) {
            onRejected2(e);
          }
        },
      };
      if (status === STATUS_ENUM.FULFILLED) {
        nextTick(() => chainObj.onFulfilled(value));
      } else if (status === STATUS_ENUM.REJECTED) {
        nextTick(() => chainObj.onRejected(reason));
      } else {
        chain.push(chainObj);
      }
    });
  }
  catch(onRejected) {
    this.then(null, onRejected);
  }
  finally() {

  }
}

export default PromiseLet;
