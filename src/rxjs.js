// an observable is a function that accepts a producer in parameter and has a subscribe method
// a producer is a function that throws/produce values and accepts an observer
// an observer is just an object that has 3 functions: next, error, complete
// and listen to the value emitted  by the producer
export class Observable {
  _producer;

  constructor(producer) {
    this._producer = producer;
  }

  subscribe(next, error, complete) {
    const observer = (typeof next !== 'function')
      ? next
      : {next, error, complete};
    return this._producer(observer);
  }
}

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
  const producer = (observer) => {
    let counter = 0;
    const id = setInterval(() => {
      observer.next(counter++);
    }, period);
    return () => {
      clearInterval(id);
    };
  };
  return new Observable(producer);
};

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
  const producer = (observer) => {
    for (let el of args) {
      observer.next(el)
    }
    observer.complete();
  };
  return new Observable(producer);
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
  const producer = (observer) => {
    try {
      for (let el of args) {
        observer.next(el)
      }
      observer.complete()
    } catch (error) {
      observer.error(error);
    }
  };
  return new Observable(producer);
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
  return new Observable((observer) => {
    if (typeof promise.then !== 'function') {
      observer.error(' The function provided in argument should be a Promise');
      observer.complete();
      return;
    }

    promise.then((data) => {
      observer.next(data);
      observer.complete();
    }).catch((err) => {
      observer.error('Error in the resolution of the promise');
      observer.complete();
    })
  });
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
  return new Observable((observer) => {

    if (typeof input.then === 'function') {
      return Observable.fromPromise(input).subscribe(observer);
    }

    return Observable.fromArray(input).subscribe(observer);
  });
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
  const observable = thisArgs || this;
  return new Observable((observer) => {
    observable
      .subscribe((data) => {
        observer.next(projection(data));
      }, (err) => {
        observer.error(err);
      }, () => {
        observer.complete();
      });
  });
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
  const observable = thisArgs || this;
  return new Observable((observer) => {
    observable
      .subscribe((data) => {
        const res = predicate(data);
        if (res) {
          observer.next(data);
        }
      }, (err) => {
        observer.error(err);
      }, () => {
        observer.complete();
      });
  });
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
  return this.map((e) => constant);
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
Observable.prototype.do = function (next = (() => {
}), error = (() => {
}), complete = (() => {
})) {
  return new Observable((observer) => {
    this
      .subscribe((data) => {
        next(data);
        observer.next(data);
      }, (err) => {
        error(err);
        observer.error(err);
      }, () => {
        complete();
        observer.complete();
      });
  });

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
  const observable = this;
  return new Observable((observer) => {
    args.forEach((value) => observer.next(value));
    observable.subscribe((data) => {
      observer.next(data);
    }, (err) => {
      observer.error(err);
    }, () => {
      observer.complete();
    });
  });
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
  const observable = this;
  return new Observable((observer) => {
    const sources$ = observables.slice();

    if (typeof observable.subscribe === 'function') {
      observable.subscribe(observer.next, observer.error, concat);
      return;
    }
    concat();
    function concat() {
      let subscribed = false;
      let obs$;
      while (sources$.length !== 0) {
        if (!subscribed) {
          obs$ = sources$.shift();
          subscribed = true;
          obs$
            .subscribe(observer.next, observer.error, () => {
              subscribed = false;
            });
        }
      }
      observer.complete();
    }
  });
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
  const observable = this;
  return new Observable((observer) => {
    let counter = 0;
    observable.subscribe((data) => {
      if (counter++ < count) {
        observer.next(data);
        return;
      }
    }, (err) => {
      observer.error(err);
    }, () => {
      observer.complete();
    });
  });
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
  if (predicate) {
    return this.filter(predicate).take(1);
  }
  return this.take(1);

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
  const observable = this;
  return new Observable((observer) => {
    let counter = 0;
    observable
      .subscribe(
        (data) => {
          if (counter++ >= the) {
            observer.next(data);
            return;
          }
        },
        (err) => observer.error(err),
        () => observer.complete()
      );
  });
};
