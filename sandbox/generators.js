//
// Generators in Node.js: Common Misconceptions an Three Good Use Cases
// https://strongloop.com/strongblog/how-to-generators-node-js-yield-use-cases/
//
// Further reading on topic:
// https://medium.com/@tjholowaychuk/callbacks-vs-coroutines-174f1fe66127#.uqol9beow
// http://jlongster.com/A-Study-on-Solving-Callbacks-with-JavaScript-Generators
// https://strongloop.com/strongblog/node-js-express-introduction-koa-js-zone/
// http://eladnava.com/write-synchronous-node-js-code-with-es6-generators/
// https://blog.risingstack.com/asynchronous-javascript/
// https://blog.risingstack.com/how-to-become-a-better-node-js-developer-in-2016/
//

'use strict';

const ENABLE_SIMPLE_EXAMPLES = false;
const ENABLE_LAZY_EVALUATION_EXAMPLES = true;
const ENABLE_ASYNC_CONTROL_FLOW_EXAMPLES = true;

//
// Simple examples:
//

(function (enabled) {
    
  if (!enabled) return

  console.log('Running simple examples...')

  //
  // create an ordinary fiboncacci routine
  //
  let fibonacci = function (n) {
    var current = 0, next = 1, swap
    for (var i = 0; i < n; i++) {
      swap = current, current = next
      next = swap + next
    }
    return current
  }

  //
  // create a fibonacci generator
  //
  let fibonacciGenerator = function* (n) {
    var current = 0, next = 1, swap
    for (var i = 0; i < n; i++) {
      swap = current, current = next
      next = swap + next
    }
    yield current    
  }

  //
  // benchmark fibonacci vs. fibonacci generator
  //
  let suite = new (require('benchmark')).Suite
  suite
  .add('regular', function () {
    fibonacci(20)
  })
  .add('generator', function () { 
    for(var n of fibonacciGenerator(20)); 
  })
  .on('complete', function () {
    console.log('results:')
    this.forEach(function (result) {
      console.log(result.name, result.count)
    })  
  }).run()

})(ENABLE_SIMPLE_EXAMPLES);

//
// Lazy evaluation:
//

(function (enabled) {
    
  if (!enabled) return
    
  console.log('Running lazy evaluation examples...')
    
  //
  // create an infinite sequence of fibonacci numbers
  //
  let fibonacci = function* () {
    var current = 0, next = 1, swap
    while (true) {
      swap = current, current = next
      next = swap + next
      yield current
    }
  }
    
  const threshold = 5000
  for (var num of fibonacci()) {
    if(num > threshold) break
  }
    
  console.log(num)
    
})(ENABLE_LAZY_EVALUATION_EXAMPLES);

//
// Asynchronous control flow:
//

(function (enabled) {

  if (!enabled) return
    
  console.log('Running asynchronous control flow examples...')

  //
  // Thunkify converts asynchronous node.js style callback functions
  // into thunks, a subroutine value we can reference until its ready
  // to be executed:
  //
  // [1] - Take an existing node.js callback style function as an input.
  // [2] - Return a function that converts node.js style into a thunk-style.
  // [3] - Enable the asynchronous function to be executed independently
  //       from its initial setup by delaying the execution until its
  //       returned function is called.
  // 
  // Example:
  //
  // var fs = require('fs')
  // var readFile = thunkify(fs.readFile) // [1]
  // var readAsyncJs = readFile('./async.js') // [2]
  // readAsyncJs(function(er, buf) { ... }) // [3]
  //
  // [1] - Turns fs.readFile into a thunk-style function.
  // [2] - Setup readFile to read async.js using the same fs.readFile API
  //       without passing the callback argument. No asynchronous operation
  //       is performed yet.
  // [3] - Perform the asynchronous operation and callback.
  //
  function thunkify (nodefn) { // [1]
    return function () { // [2]
      var args = Array.prototype.slice.call(arguments)
      return function (cb) { // [3]
        args.push(cb)
        nodefn.apply(this, args)
      }
    }
  }
    
  //
  // Run function takes a generator function and handles any yielded thunks:
  //
  // [1] - Immediately invoke the generator function. This returns a generator
  //       in a suspended state.
  // [2] - Then, invoke the next function. We call it right away to tell the 
  //       generator to resume execution (since next triggers gen.next()).
  // [3] - Notice how next looks just like the node.js callback signature
  //       (er, value). Every time a thunk completes its asynchronous operation
  //       we will call this function.
  // [4] - If there was an error from the asynchronous operation, throw the
  //       error back into the generator to be handled there.
  // [5] - If successful, send the value back to the generator. This value
  //       gets returned from the yield call.
  // [6] - If we have no more left to do in our generator, then stop by
  //       returning early.
  // [7] - If we have more to do, take the value of the next yield and
  //       execute it using our next as the callback.
  //
  function run (genfn) {
    var gen = genfn() // [1]
    next() // [2]
        
    function next (er, value) { // [3]
      if (er) return gen.throw(er) // [4]
      var continuable = gen.next(value) // [5]
            
      if (continuable.done) return // [6]
      var cbfn = continuable.value // [7]
      cbfn(next);
    }
  }
    
  var fs = require('fs')
  var readFile = thunkify(fs.readFile)
    
  run(function* () {
    try {
      var file = yield readFile('./sandbox/fibonacci.js')
      console.log(file.toString())
    }
    catch (er) {
      console.error(er)
    }
  })

})(ENABLE_ASYNC_CONTROL_FLOW_EXAMPLES);