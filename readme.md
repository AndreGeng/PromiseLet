Promise A+ implementation for learning purpose.

Promise.resolve
Promise.reject
Promise.all
Promise.race
Promise.prototype.catch
Promise.prototype.finally
is not strictly implemented as [ECMA-262](https://www.ecma-international.org/ecma-262/6.0/).

Again this project is for learning purpose^_^

[promise a+ specific](https://promisesaplus.com/)

# Promise状态
1. promise对象有三种状态pending, fulfilled, rejected, promise pending状态, 只可转变为fulfilled或rejected
2. fulfilled态的promise，不可再转变为其它态，它有且仅有一个不变的value
3. rejected态的promise, 不可再转变为其它态，它有且仅有一个不变的reason

# then方法
1. promise对象有then方法，它接收两个可选参数onFulfilled, onRejected, 这两个参数不为function则被ignore
2. 如果onFulfilled是一个方法，只能在promise被fulfill时被调用一次。它的第一个参数是promise被fulfill时的value
3. 如果onRejected是一个方法，只能在promise被reject时被调用一次。 它的第一个参数是promise被reject时的reason
4. onFulfilled/onRejected必须是被异步调用的
5. onFulfilled/onRejected必须以函数的方式被调用（也就是说函数内部的this为undefined/global）
6. then方法可以在一个promise上调用多次，当promise被fulfill时，这些回调执行的顺序，遵循它们添加的顺序，被reject时同理
7. then方法的返回值为promise. promise2 = promise1.then(onFulfilled, onRejected)
  - 如果onFulfilled/onRejected返回value x, 遵循[[Resolve]](promise2, x)
  - 如果onFulfilled/onRejected抛出异常e, promise2也要以e为reason被reject.
  - 如果onFulfilled不为function, promise1 fulfill时，promise2要以同样的value被fulfill
  - 如果onRejected不为function, promise1 reject时，promise2要以同样的reason被reject

# [[Resolve]](promise, x)
1. 如果promise和x指向同一个对象，reject promise, 并以一个TypeError为reason
2. 如果x是promise对象
  - 如果x处于pending状态，promise也必须处于pending状态，直到x被fulfilled或rejected
  - 如果x处于fulfilled状态，用同样的value fulfill promise
  - 如果x处于rejected有状态，用同样的reason reject promise
3. 如果x是object/function
  - then相当于x.then
  - 如果访问x.then时抛出错误e, 那用e作为reason, reject promise
  - 如果then是一个function, 则以x用为this调用它，第一个参数为resolvePromise，第二个参数为rejectPromise
    + 如果resolvePromise被以y为value resolve, run [[Resolve]](promise, y)
    + 如果rejectPromise被以r为reason reject, 用r reject promise
    + 如果resolvePromise和rejectPromise被调用多次，取第一次的调用结果，ignore其它结果
    + 如果调用then时，抛出异常e, 如果resolvePromise/rejectPromise已经被调用过了，ignore e, 否则reject promise with e
  - 如果then不是function, 以x为value fulfill promise
4. 如果x不是object/function, fulfill promise with x
5. 如果[[Resolve]](promise, thenable)的调用导致了，死循环，抛出TypeError异常
