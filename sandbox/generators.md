# Generators in Node.js
** Common Misconceptions an Three Good Use Cases **

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