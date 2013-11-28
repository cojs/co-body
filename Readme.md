
# co-body

  Parse request bodies with generators.

## Installation

```
$ npm install co-body
```

## Example

```js
// application/json
var body = yield parse.json(req);

// application/x-www-form-urlencoded
var body = yield parse.form(req);

// either
var body = yield parse(req);
```

## Koa

  This lib also supports `ctx.req` in Koa (or other libraries),
  so that you may simply use `this` instead of `this.req`.

```js
// application/json
var body = yield parse.json(this);

// application/x-www-form-urlencoded
var body = yield parse.form(this);

// either
var body = yield parse(this);
```

# License

  MIT