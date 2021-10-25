// fulfilled
// rejected

const PROMISE_STATUS_PENDING = "pending"
const PROMISE_STATUS_FULFILLED = "fulfilled"
const PROMISE_STATUS_REJECTED = "rejected"

// 工具函数
function execFunctionWithCatchError(execFn, value, resolve, reject) {
  try {
    const result = execFn(value)
    resolve(result)
  } catch (err) {
    reject(err)
  }
}

class yhPromise {
  constructor(executor) {
    this.state = PROMISE_STATUS_PENDING
    this.fulfilled = [] // then数组
    this.rejected = [] // catch数组
    this.value = undefined
    this.reason = undefined

    const resolve = value => {
      if (this.state === PROMISE_STATUS_PENDING) {
        queueMicrotask(() => {
          if (this.state !== PROMISE_STATUS_PENDING) return
          this.state = PROMISE_STATUS_FULFILLED
          this.value = value
          this.fulfilled.forEach(fn => {
            fn()
          })
        })
      }
    }
    const reject = reason => {
      if (this.state === PROMISE_STATUS_PENDING) {
        queueMicrotask(() => {
          if (this.state !== PROMISE_STATUS_PENDING) return
          this.state = PROMISE_STATUS_REJECTED
          this.reason = reason
          this.rejected.forEach(fn => {
            fn()
          })
        })
      }
    }

    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }

  then(onFulfilled, onRejected) {
    // catch方法 第一个promise 是一个reject的状态 但then没有异常的捕获 则用catch的方法
    const defaultOnRejected = err => {
      throw err
    }
    onRejected = onRejected || defaultOnRejected

    // 兼容finally 给onFulfilled默认值
    const defaultOnFulfilled = value => {
      return value
    }
    onFulfilled = onFulfilled || defaultOnFulfilled

    return new yhPromise((resolve, reject) => {
      // 1.如果在then调用的时候, 状态已经确定下来
      if (this.state === PROMISE_STATUS_FULFILLED && onFulfilled) {
        execFunctionWithCatchError(onFulfilled, this.value, resolve, reject)
      }
      if (this.state === PROMISE_STATUS_REJECTED && onRejected) {
        execFunctionWithCatchError(onRejected, this.reason, resolve, reject)
      }

      // 2.将成功回调和失败的回调放到数组中
      if (this.state === PROMISE_STATUS_PENDING) {
        if (onFulfilled) {
          this.fulfilled.push(() => {
            execFunctionWithCatchError(onFulfilled, this.value, resolve, reject)
          })
        }
        if (onRejected) {
          this.rejected.push(() => {
            execFunctionWithCatchError(onRejected, this.reason, resolve, reject)
          })
        }
      }
    })
  }

  catch(onRejected) {
    return this.then(undefined, onRejected)
  }

  finally(onFinally) {
    this.then(
      () => {
        onFinally()
      },
      () => {
        onFinally()
      }
    )
  }

  static resolve(value) {
    return new yhPromise((resolve, reject) => resolve(value))
  }

  static reject(reason) {
    return new yhPromise((resolve, reject) => reject(reason))
  }

  static all(promises) {
    // 问题关键: 什么时候要执行resolve, 什么时候要执行reject
    return new yhPromise((resolve, reject) => {
      const result = []
      promises.forEach(promise => {
        promise
          .then(res => {
            result.push(res)
            if (result.length === promises.length) {
              resolve(result)
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    })
  }

  static allSettled(promises) {
    return new yhPromise((resolve, reject) => {
      const result = []
      promises.forEach(promise => {
        promise.then(
          res => {
            result.push({ state: PROMISE_STATUS_FULFILLED, value: res })
            if (result.length === promises.length) {
              resolve(result)
            }
          },
          err => {
            result.push({ state: PROMISE_STATUS_REJECTED, value: err })
            if (result.length === promises.length) {
              resolve(result)
            }
          }
        )
      })
    })
  }

  static race(promises) {
    return new yhPromise((resolve, reject) => {
      promises.forEach(promise => {
        promise.then(resolve, reject)
      })
    })
  }

  static any(promises) {
    // resolve必须等到有一个成功的结果
    // reject所有的都失败才执行reject
    const reasons = []
    return new yhPromise((resolve, reject) => {
      promises.forEach(promise => {
        promise.then(resolve, err => {
          reasons.push(err)
          if (reasons.length === promises.length) {
            reject(new AggregateError(reasons))
          }
        })
      })
    })
  }
}

const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(1111)
  }, 1000)
})
const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(2222)
  }, 50)
})
const p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(3333)
  }, 3000)
})

yhPromise
  .any([p1, p2, p3])
  .then(res => {
    console.log(res)
  })
  .catch(err => {
    console.log(err.errors)
  })
