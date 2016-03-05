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
```

#### Example:

```javascript
var fs = require('fs')
var readFile = thunkify(fs.readFile) // [1]
var readAsyncJs = readFile('./async.js') // [2]
readAsyncJs(function(er, buf) { ... }) // [3]
```

1. Turns fs.readFile into a thunk-style function.
2. Setup readFile to read async.js using the same fs.readFile API  without passing the callback argument. No asynchronous operation  is performed yet.
3. Perform the asynchronous operation and callback.
