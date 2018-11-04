import PromiseLet from '../dist/index.js';

describe('Promise', () => {
  describe('then method', () => {
    test('onFulfilled callback should be called, when promise resolved', (done) => {
      const onFulfilled = jest.fn();
      const p = new PromiseLet((resolve) => {
        resolve();
        setTimeout(() => {
          expect(onFulfilled.mock.calls.length).toBe(1);
          done();
        }, 0);
      });
      p.then(onFulfilled);
    });
    test('onRejected callback should be called, when promise rejected', (done) => {
      const onRejected = jest.fn();
      const p = new PromiseLet((resolve, reject) => {
        reject();
        setTimeout(() => {
          expect(onRejected.mock.calls.length).toBe(1);
          done();
        }, 0);
      });
      p.then(()=>{}, onRejected);
    });
    test('onFulfilled can only be called once', (done) => {
      const onFulfilled = jest.fn();
      const p = new PromiseLet((resolve) => {
        resolve('value');
        resolve('value2');
        setTimeout(() => {
          expect(onFulfilled.mock.calls.length).toBe(1);
          expect(onFulfilled).toBeCalledWith('value');
          done();
        }, 0);
      });
      p.then(onFulfilled);
    });
    test('onRejected can only be called once', (done) => {
      const onRejected = jest.fn();
      const p = new PromiseLet((resolve, reject) => {
        reject('reason');
        reject('reason2');
        setTimeout(() => {
          expect(onRejected.mock.calls.length).toBe(1);
          expect(onRejected).toBeCalledWith('reason');
          done();
        }, 0);
      });
      p.then(() => {}, onRejected);
    });
    test('onFulfilled should be called async', (done) => {
      const onFulfilled = jest.fn();
      const p = new PromiseLet((resolve) => {
        resolve('value');
        expect(onFulfilled.mock.calls.length).toBe(0);
        setTimeout(() => {
          expect(onFulfilled.mock.calls[0][0]).toBe('value');
          done();
        }, 0);
      });
      p.then(onFulfilled);
    });
    test('onFulfilled should be called as function', (done) => {
      const onFulfilled = jest.fn();
      const p = new PromiseLet((resolve) => {
        resolve('value');
        setTimeout(() => {
          expect(onFulfilled.mock.instances[0]).toBe(undefined);
          done();
        }, 0);
      });
      p.then(onFulfilled);
    });
    test('onReject should be called as function', (done) => {
      const onRejected = jest.fn();
      const p = new PromiseLet((resolve, reject) => {
        reject('reason');
        setTimeout(() => {
          expect(onRejected.mock.instances[0]).toBe(undefined);
          done();
        }, 0);
      });
      p.then(() => {}, onRejected);
    });
    test('can be called on a promise multiple times, once promise is fulfilled, invoke onFulfilled as the same order when they attached', (done) => {
      let sequence = 1;
      const onFulfilled = jest.fn(() => ++sequence);
      const onFulfilled2 = jest.fn(() => ++sequence);
      const promise = new PromiseLet((resolve, reject) => {
        resolve('value');
        setTimeout(() => {
          expect(onFulfilled.mock.calls.length).toBe(1);
          expect(onFulfilled2.mock.calls.length).toBe(1);
          expect(onFulfilled.mock.results[0].value).toBe(2);
          expect(onFulfilled2.mock.results[0].value).toBe(3);
          done();
        }, 0);
      });
      promise.then(onFulfilled);
      promise.then(onFulfilled2);
    });
    test('can be called on a promise multiple times, once promise is rejected, invoke onRejected as the same order when they attached', (done) => {
      let sequence = 1;
      const onRejected = jest.fn(() => ++sequence);
      const onRejected2 = jest.fn(() => ++sequence);
      const promise = new PromiseLet((resolve, reject) => {
        reject('reason');
        setTimeout(() => {
          expect(onRejected.mock.calls.length).toBe(1);
          expect(onRejected2.mock.calls.length).toBe(1);
          expect(onRejected.mock.results[0].value).toBe(2);
          expect(onRejected2.mock.results[0].value).toBe(3);
          done();
        }, 0);
      });
      promise.then(null, onRejected);
      promise.then(null, onRejected2);
    });
    test('if onFulfilled throw a exception, the promise returned by then method should reject with the same reason', (done) => {
      let promise2;
      const randomErr = new Error('test');
      const onFulfilled = jest.fn().mockImplementation(() => throw randomErr);
      const onRejected2 = jest.fn();
      const p = new PromiseLet((resolve) => {
        resolve('value');
        setTimeout(() => {
          expect(onRejected2.mock.calls.length).toBe(1);
          expect(onRejected2.mock.calls[0][0]).toBe(randomErr);
          done();
        }, 10);
      });
      promise2 = p.then(onFulfilled);
      promise2.then(() => {}, onRejected2);
    });
    test('if onRejected throw a exception, the promise returned by then method should reject with the same reason', (done) => {
      let promise2;
      const randomErr = new Error('test');
      const onRejected = jest.fn(() => (throw randomErr));
      const onRejected2 = jest.fn();
      const p = new PromiseLet((resolve, reject) => {
        reject('reason');
        setTimeout(() => {
          expect(onRejected2.mock.calls.length).toBe(1);
          expect(onRejected2.mock.calls[0][0]).toBe(randomErr);
          done();
        }, 10);
      });
      promise2 = p.then(() => {}, onRejected);
      promise2.then(() => {}, onRejected2);
    });
    test('if onFulfilled is not a function, resolve the promise returned by then by the same value', (done) => {
      let promise2;
      const onFulfilled = jest.fn();
      const p = new PromiseLet((resolve, reject) => {
        resolve('value');
        setTimeout(() => {
          expect(onFulfilled.mock.calls.length).toBe(1);
          expect(onFulfilled.mock.calls[0][0]).toBe('value');
          done();
        }, 10);
      });
      promise2 = p.then(null);
      promise2.then(onFulfilled);
    });
    test('if onRejected is not a function, reject the promise returned by then by the same reason', (done) => {
      let promise2;
      const onRejected = jest.fn();
      const p = new PromiseLet((resolve, reject) => {
        reject('reason');
        setTimeout(() => {
          expect(onRejected.mock.calls.length).toBe(1);
          expect(onRejected.mock.calls[0][0]).toBe('reason');
          done();
        }, 10);
      });
      promise2 = p.then(null, null);
      promise2.then(null, onRejected);
    });
  });
  describe('status', () => {
    test('resolved promise can not be rejected', (done) => {
      const onFulfilled= jest.fn();
      const onRejected = jest.fn();
      const p = new PromiseLet((resolve, reject) => {
        resolve('value');
        reject();
        setTimeout(() => {
          expect(onFulfilled.mock.calls.length).toBe(1);
          expect(onFulfilled.mock.calls[0][0]).toBe('value');
          expect(onRejected.mock.calls.length).toBe(0);
          done();
        }, 0);
      });
      p.then(onFulfilled, onRejected);
    });
    test('rejected promise can not be resolved', (done) => {
      const onFulfilled= jest.fn();
      const onRejected = jest.fn();
      const p = new PromiseLet((resolve, reject) => {
        reject('reason');
        resolve();
        setTimeout(() => {
          expect(onRejected.mock.calls.length).toBe(1);
          expect(onRejected.mock.calls[0][0]).toBe('reason');
          expect(onFulfilled.mock.calls.length).toBe(0);
          done();
        }, 0);
      });
      p.then(onFulfilled, onRejected);
    });
  });
  describe('resolve', () => {
    test('TypeError will be thrown if fulfilled with current promise', (done) => {
      const onRejected = jest.fn();
      const p = new PromiseLet((resolve, reject) => {
        setTimeout(() => {
          try {
            resolve(p);
          } catch(e) {
            expect(e instanceof TypeError).toBe(true);
          }
          done();
        }, 0);
      });
    });
    test('if resolve with a resolved promise, then returned promise should also be resolved', (done) => {
      const onFulfilled = jest.fn();
      let pResolve;
      const p = new PromiseLet((resolve) => {
        pResolve = resolve;
      });
      const p2 = new PromiseLet((resolve) => {
        resolve(p);
        setTimeout(() => {
          expect(onFulfilled.mock.calls.length).toBe(0);
          pResolve('value');
          setTimeout(() => {
            expect(onFulfilled.mock.calls.length).toBe(1);
            expect(onFulfilled.mock.calls[0][0]).toBe('value');
            done();
          }, 0);
        }, 0);
      });
      p2.then(onFulfilled);
    });
    test('if resolve with a rejected promise, then returned promise should also be rejected', (done) => {
      const onRejected = jest.fn();
      let pReject;
      const p = new PromiseLet((resolve, reject) => {
        pReject = reject;
      });
      const p2 = new PromiseLet((resolve) => {
        resolve(p);
        setTimeout(() => {
          expect(onRejected.mock.calls.length).toBe(0);
          pReject('reason');
          setTimeout(() => {
            expect(onRejected.mock.calls.length).toBe(1);
            expect(onRejected.mock.calls[0][0]).toBe('reason');
            done();
          }, 0);
        }, 0);
      });
      p2.then(null, onRejected);
    });
    test('if resolved with a already solved promise, then returned promse should be resolved with the same value', () => {
      const onFulfilled = jest.fn();
      const p = new PromiseLet((resolve) => {
        resolve('value');
      });
      const p2 = new PromiseLet((resolve) => {
        resolve(p);
        setTimeout(() => {
          expect(onFulfilled.mock.calls.length).toBe(1);
          expect(onFulfilled.mock.calls[0][0]).toBe('value');
        }, 0);
      });
      p2.then(onFulfilled);
    });
    test('if resolve with an object/function x, without then function, should resolve with x', () => {
      const onFulfilled = jest.fn();
      const result = {};
      const p = new PromiseLet((resolve) => {
        resolve(result);
        setTimeout(() => {
          expect(onFulfilled.mock.calls[0][0]).toBe(result);
        }, 0);
      });
      p.then(onFulfilled);
    });
    test('if x.then throw error, promise should be rejected with same reason', (done) => {
      const onRejected = jest.fn();
      const err = new Error('error');
      const result = {
        then() {
          throw err;
        }
      };
      const p = new PromiseLet((resolve) => {
        resolve(result);
        setTimeout(() => {
          expect(onRejected.mock.calls[0][0]).toBe(err);
          done();
        }, 0);
      });
      p.then(null, onRejected);
    });
    test('if resolvePromise resolved with value, promise should always resolved with value', (done) => {
      const onFulfilled = jest.fn();
      const result = {
        then(resolve) {
          resolve('value');
        }
      };
      const p = new PromiseLet((resolve) => {
        resolve(result);
        setTimeout(() => {
          expect(onFulfilled.mock.calls[0][0]).toBe('value');
          done();
        }, 0);
      });
      p.then(onFulfilled);
    });
    test('if resolvePromise asynchronously resolved with value, promise should always resolved with value', (done) => {
      const onFulfilled = jest.fn();
      const result = {
        then(resolve) {
          setTimeout(() => {
            resolve(null);
          }, 0);
        }
      };
      const p = new PromiseLet((resolve) => {
        resolve(result);
        setTimeout(() => {
          expect(onFulfilled.mock.calls[0][0]).toBe(null);
          done();
        }, 10);
      });
      p.then(onFulfilled);
    });
    test('if resolvePromise rejected with reason, promise should always rejected with reason', (done) => {
      const onRejected = jest.fn();
      const result = {
        then(resolve, reject) {
          reject('reason');
        }
      };
      const p = new PromiseLet((resolve) => {
        resolve(result);
        setTimeout(() => {
          expect(onRejected .mock.calls[0][0]).toBe('reason');
          done();
        }, 0);
      });
      p.then(null, onRejected);
    });
    test.only('if resolvePromise called multiple times asynchronously, only take the first value', (done) => {
      const onFulfilled = jest.fn();
      const result = {
        then(resolve) { // x
          resolve({
            then(res) { // y
              res({ value: 'value' });
              res({ value: 'value2' });
            }
          });
        }
      };
      const p = new PromiseLet((resolve) => {
        resolve({ dummy: 'dummy' }); // x is object/function
      }).then((value) => result);
      p.then(onFulfilled);
      setTimeout(() => {
        expect(onFulfilled.mock.calls.length).toBe(1);
        expect(onFulfilled.mock.calls[0][0]).toBe('value');
        done();
      }, 100);
    });
    // test.only('if resolvePromise called multiple times asynchronously, only take the first value', (done) => {
    //   const onFulfilled = jest.fn();
    //   const result = new PromiseLet((resolve) => {
    //     setTimeout(() => resolve('value'), 10);
    //   });
    //   const p = new PromiseLet((resolve) => {
    //     resolve(result); // x is object/function
    //     resolve('value2');
    //     setTimeout(() => {
    //       expect(onFulfilled.mock.calls.length).toBe(1);
    //       expect(onFulfilled.mock.calls[0][0]).toBe('value');
    //       done();
    //     }, 10);
    //   });
    //   p.then(onFulfilled);
    // });
    test('if rejectPromise called multiple times, only take the first reason', (done) => {
      const onRejected = jest.fn();
      const result = {
        then(resolve, reject) {
          reject('reason');
          reject('reason2');
          reject('reason3');
        }
      };
      const p = new PromiseLet((resolve) => {
        resolve(result);
        setTimeout(() => {
          expect(onRejected.mock.calls.length).toBe(1);
          expect(onRejected.mock.calls[0][0]).toBe('reason');
          done();
        }, 0);
      });
      p.then(null, onRejected);
    });
    test('if x.then throw error, resolvePromise is called, ignore the error', (done) => {
      const onFulfilled = jest.fn();
      const err = new Error('error');
      const result = {
        then(resolve) {
          resolve('value');
          throw err;
        }
      };
      const p = new PromiseLet((resolve) => {
        resolve(result);
        setTimeout(() => {
          expect(onFulfilled.mock.calls[0][0]).toBe('value');
          done();
        }, 0);
      });
      p.then(onFulfilled);
    });
  });
});
