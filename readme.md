# deferred-regl

defer operations to a [regl][] instance

[regl]: http://regl.party

# api

```
var defregl = require('deferred-regl')
```

## var dregl = defregl()

Create a new fake regl instance `dregl` that queues all operations.

## dregl.setRegl(regl)

Provide a real `regl` implementation and run all operations from the queue.

# install

npm install deferred-regl

# license

BSD
