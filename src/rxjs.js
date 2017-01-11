// an observable is a function that accepts a producer in parameter and has a subscribe method
// a producer is a function that throws/produce values and accepts an observer
// an observer is just an object that has 3 functions: next, error, complete
// and listen to the value emitted  by the producer
export class Observable {
}

/**
 * Static creation operators : of
 * Emits the arguments you provide, then completes.
 *
 * @see {@link https://www.learnrxjs.io/operators/creation/of.html } for examples.
 *
 * @param args
 * @returns {Observable}
 */
Observable.of = (...args) => {
  const o = Object.create(Observable.prototype)
  o.subscribe = (nextFn, errorFn, completeFn) => {
    args.forEach(x => nextFn(x))
    completeFn()
  }
  return o
};

/**
 * Static creation operators : interval
 * Emit numbers in sequence based on provided timeframe.
 *
 * @see {@link https://www.learnrxjs.io/operators/creation/interval.html } for examples.
 *
 * @param period {Number}
 * @returns {Observable}
 */
Observable.interval = (period) => {
  const o = Object.create(Observable.prototype)
  o.subscribe = (nextFn) => {
    let count = 0
    const timeout = setInterval(function () {
      nextFn(count++)
    }, period)
    return clearInterval.bind(null, timeout)
  }
  return o
};



/**
 * Static creation operators : fromArray
 * Converts an array to an Observable.
 *
 * /!\ doesn't exist in Rxjs, so use from operators see below
 * @see {@link https://www.learnrxjs.io/operators/creation/from.html } for examples.
 *
 * @param args {Array}
 * @returns {Observable}
 */
Observable.fromArray = (args = []) => {
  return Observable.of(...args)
};

/**
 * Static creation operators : fromPromise
 * Converts an promise to an Observable.
 *
 * @see {@link https://www.learnrxjs.io/operators/creation/frompromise.html } for examples.
 *
 * @param promise {Promise}
 * @returns {Observable}
 */
Observable.fromPromise = (promise = {}) => {
  const o = Object.create(Observable.prototype)
  o.subscribe = (nextFn, errorFn, completeFn) => {
    promise
      .then(val => nextFn(val))
      .then(() => completeFn())
  }
  return o
};

/**
 * Static creation operators : from
 * Converts almost anything to an Observable
 *
 * @see {@link https://www.learnrxjs.io/operators/creation/from.html } for examples.
 *
 * @param input
 * @returns {Observable}
 */
Observable.from = (input) => {
  if (input && typeof input.then === 'function') {
    return Observable.fromPromise(input)
  }
  if (Array.isArray(input)) {
    return Observable.of(...input)
  }
  if (input && typeof input === 'string') {
    const newInput = input.split('')
    return Observable.of(...newInput)
  }
  if (input && input instanceof Map) {
    const newInput = input.entries()
    return Observable.of(...newInput)
  }
};

/**
 * Transformation operators : map
 * Apply a projection to each value and emits that projection in the returned observable
 *
 * @see {@link https://www.learnrxjs.io/operators/transformation/map.html } for examples.

 * @param projection
 * @param thisArgs: an optional argument to define what this is in the project function
 * @returns {Observable}
 */

Observable.prototype.map = Observable.map = function (projection, thisArgs) {
  const o = Object.create(Observable.prototype)
  o.subscribe = (nextFn, errorFn, completeFn) => {
    if (thisArgs && thisArgs instanceof Observable) {
      thisArgs.subscribe(val => {
        nextFn(projection(val))
      }, errorFn, completeFn)
    } else {
      this.subscribe(val => {
        nextFn(projection(val))
      }, errorFn, completeFn)
    }
  }
  return o
};

/**
 * Filtering operators : filter
 * only emits a value from the source if it passes a criterion function.
 *
 * @see {@link https://www.learnrxjs.io/operators/filtering/filter.html } for examples.

 * @param predicate
 * @param thisArgs: an optional argument to define what this is in the project function
 * @returns {Observable}
 */
Observable.prototype.filter = Observable.filter = function (predicate, thisArgs) {
  const o = Object.create(Observable.prototype)
  o.subscribe = (nextFn, errorFn, completeFn) => {
    if (thisArgs && thisArgs instanceof Observable) {
      thisArgs.subscribe(val => {
        if (predicate(val)) nextFn(val)
      }, errorFn, completeFn)
    } else {
      this.subscribe(val => {
        if (predicate(val)) nextFn(val)
      }, errorFn, completeFn)
    }
  }
  return o
};

/**
 * Transformation operators : mapTo
 * Maps every value to the same value every time
 *
 * @see {@link https://www.learnrxjs.io/operators/transformation/mapto.html } for examples.
 *
 * @param constant
 * @returns {Observable}
 */
Observable.prototype.mapTo = function (constant) {
  const o = Object.create(Observable.prototype)
  o.subscribe = (nextFn, errorFn, completeFn) => {
    this.subscribe(() => {
      nextFn(constant)
    }, errorFn, completeFn)
  }
  return o
};

/**
 * Transformation operators : do
 * Transparently perform actions or side-effects, such as logging.
 *
 * @see {@link https://www.learnrxjs.io/operators/utility/do.html } for examples.
 *
 * @param next
 * @param error
 * @param complete
 * @returns {Observable}
 */
Observable.prototype.do = function (next, error, complete) {
  next()
  return this
};


/**
 * Combinations operators : startWith
 * Emit given value first
 *
 * @see {@link https://www.learnrxjs.io/operators/combination/startwith.html} for examples.
 *
 * @param args {Array}
 * @returns {Observable}
 */
Observable.prototype.startWith = function (...args) {
  const o = Object.create(Observable.prototype)
  o.subscribe = (nextFn, errorFn, completeFn) => {
    args.forEach(x => nextFn(x))
    this.subscribe(val => {
      nextFn(val)
    }, errorFn, completeFn)
  }
  return o
};

/**
 * Combinations operators : concat
 * Concatenates multiple Observables together by sequentially emitting their values, one Observable after the other.
 *
 * @see {@link https://www.learnrxjs.io/operators/combination/concat.html} for examples.
 *
 * @param args {Array}
 * @returns {Observable}
 */
Observable.prototype.concat = Observable.concat = function (...observables) {
  const o = Object.create(Observable.prototype)
  o.subscribe = (nextFn, errorFn, completeFn) => {
    if (typeof this.subscribe === 'function') {
      this.subscribe(val => {
        nextFn(val)
      }, errorFn, callback)
    } else {
      callback()
    }
    function callback() {
      let isDone = true // necessary hack so observables can emit sequentially
      observables.forEach(obs => {
        if (isDone) {
          isDone = false
          obs.subscribe(v => nextFn(v), errorFn, () => {
            isDone = true
          })
        }
      })
    }
    completeFn()
  }
  return o
};

/**
 * Filtering operators : take
 * Takes the first count values from the source, then completes.
 *
 * @see {@link https://www.learnrxjs.io/operators/filtering/take.html } for examples.
 *
 * @param count {Number}
 * @returns {Observable}
 */
Observable.prototype.take = function (count) {
  const o = Object.create(Observable.prototype)
  o.subscribe = (nextFn, errorFn, completeFn) => {
    let i = 0;
    this.subscribe(val => {
      if (++i <= count) nextFn(val)
    }, errorFn, completeFn)
  }
  return o
};

/**
 * Filtering operators : first
 * Emits only the first value. Or emits only the first value that passes some test.
 *
 * @see {@link https://www.learnrxjs.io/operators/filtering/first.html } for examples.
 *
 * @param predicate {Function}
 * @returns {Observable}
 */
Observable.prototype.first = function (predicate) {
  const o = Object.create(Observable.prototype)
  o.subscribe = (nextFn, errorFn, completeFn) => {
    let bool = true;
    this.subscribe(val => {
      if (bool) {
        if ((typeof predicate === 'function') && predicate(val)) {
          bool = false
          nextFn(val)
        } else if (predicate === undefined) {
          bool = false
          nextFn(val)
        }
      }
    }, errorFn, completeFn)
  }
  return o
};

/**
 * Filtering operators : skip
 * Returns an Observable that skips n items emitted by an Observable.
 *
 * @see {@link https://www.learnrxjs.io/operators/filtering/skip.html } for examples.
 *
 * @param the {Function}
 * @returns {Observable}
 */
Observable.prototype.skip = function (the) {
  const o = Object.create(Observable.prototype)
  o.subscribe = (nextFn, errorFn, completeFn) => {
    let bool = false;
    this.subscribe(val => {
      if (bool) {
        nextFn(val)
      } else {
        if (val === the) {
          bool = true
        }
      }
    }, errorFn, completeFn)
  }
  return o
};
