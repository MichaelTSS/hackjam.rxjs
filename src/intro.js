// an observable is a function that accepts a producer in parameter and has a subscribe method
// a producer is  a function that throws/produces values and accepts an observer
// an observer is just an object that has 3 functions: next, error, complete
//  and listen to the value emitted  by the producer
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
 * Create a producer that emit 3 times the value 10
 * and complete
 * @param observer
 */


/**
 * Create a new observable that accept this tenProducer
 * and subscribe to it
 * @type {Observable}
 */
