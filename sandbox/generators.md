# Generators in Node.js
__Common Misconceptions an Three Good Use Cases__

## Asynchronous control flow:

### thunkify()

Thunkify converts asynchronous node.js style callback functions
into thunks, a subroutine value we can reference until its ready
to be executed:

1. Take an existing node.js callback style function as an input.
2. Return a function that converts node.js style into a thunk-style.
3. Enable the asynchronous function to be executed independently  from its initial setup by delaying the execution until its  returned function is called.

```javascript
function thunkify(nodefn) { // [1]
    return function() { // [2]
        var args = Array.prototype.slice.call(arguments)
        return function(cb) { // [3]
            args.push(cb)
            nodefn.apply(this, args)
        }
    }
}


#### Example:

```javascript
var fs = require('fs')
var readFile = thunkify(fs.readFile) // [1]
var readAsyncJs = readFile('./async.js') // [2]
readAsyncJs(function(er, buf) { ... }) // [3]
```

1. Turns `fs.readFile` into a thunk-style function.
2. Setup `readFile` to read async.js using the same `fs.readFile` API  without passing the callback argument. No asynchronous operation  is performed yet.
3. Perform the asynchronous operation and callback.

### run()

Run function takes a generator function and handles any yielded thunks:

1. Immediately invoke the generator function. This returns a generator  in a suspended state.
2. Then, invoke the `next()` function. We call it right away to tell the  generator to resume execution (since next triggers `gen.next()`).
3. Notice how `next()` looks just like the node.js callback signature  `(er, value)`. Every time a thunk completes its asynchronous operation  we will call this function.
4. If there was an error from the asynchronous operation, throw the  error back into the generator to be handled there.
5. If successful, send the value back to the generator. This value  gets returned from the `yield` call.
6. If we have no more left to do in our generator, then stop by  returning early.
7. If we have more to do, take the value of the next yield and  execute it using our `next()` as the callback.

```javascript
function run(genfn) {
    var gen = genfn() // [1]
    next() // [2]
    
    function next(er, value) { // [3]
        if (er) return gen.throw(er) // [4]
        var continuable = gen.next(value) // [5]
        
        if (continuable.done) return // [6]
        var cbfn = continuable.value // [7]
        cbfn(next);
    }
}
```

#### Example:

```javascript
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
```