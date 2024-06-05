# co-body

[![NPM version][npm-image]][npm-url]
[![CI](https://github.com/cojs/co-body/actions/workflows/node.yml/badge.svg)](https://github.com/cojs/co-body/actions/workflows/node.yml)
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/co-body.svg?style=flat-square
[npm-url]: https://npmjs.org/package/co-body
[codecov-image]: https://codecov.io/github/cojs/co-body/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/cojs/co-body?branch=master
[download-image]: https://img.shields.io/npm/dm/co-body.svg?style=flat-square
[download-url]: https://npmjs.org/package/co-body

> Parse request bodies with generators inspired by [Raynos/body](https://github.com/Raynos/body).

## Installation

```bash
$ npm install co-body
```

## Options

  - `limit` number or string representing the request size limit (1mb for json and 56kb for form-urlencoded)
  - `strict` when set to `true`, JSON parser will only accept arrays and objects; when `false` will accept anything `JSON.parse` accepts. Defaults to `true`. (also `strict` mode will always return object).
  - `onProtoPoisoning` Defines what action the `co-body` lib must take when parsing a JSON object with `__proto__`. This functionality is provided by [bourne](https://github.com/hapijs/bourne).
    See [Prototype-Poisoning](https://fastify.dev/docs/latest/Guides/Prototype-Poisoning/) for more details about prototype poisoning attacks.
    Possible values are `'error'`, `'remove'` and `'ignore'`.
    Default to `'error'`, it will throw a `SyntaxError` when `Prototype-Poisoning` happen.
  - `queryString` an object of options when parsing query strings and form data. See [qs](https://github.com/hapijs/qs) for more information.
  - `returnRawBody` when set to `true`, the return value of `co-body` will be an object with two properties: `{ parsed: /* parsed value */, raw: /* raw body */}`.
  - `jsonTypes` is used to determine what media type **co-body** will parse as **json**, this option is passed directly to the [type-is](https://github.com/jshttp/type-is) library.
  - `formTypes` is used to determine what media type **co-body** will parse as **form**, this option is passed directly to the [type-is](https://github.com/jshttp/type-is) library.
  - `textTypes` is used to determine what media type **co-body** will parse as **text**, this option is passed directly to the [type-is](https://github.com/jshttp/type-is) library.

more options available via [raw-body](https://github.com/stream-utils/raw-body#getrawbodystream-options-callback):

## Example

```js
// application/json
var body = await parse.json(req);

// explicit limit
var body = await parse.json(req, { limit: '10kb' });

// application/x-www-form-urlencoded
var body = await parse.form(req);

// text/plain
var body = await parse.text(req);

// either
var body = await parse(req);

// custom type
var body = await parse(req, { textTypes: ['text', 'html'] });
```

## Koa

  This lib also supports `ctx.req` in Koa (or other libraries),
  so that you may simply use `this` instead of `this.req`.

```js
// application/json
var body = await parse.json(this);

// application/x-www-form-urlencoded
var body = await parse.form(this);

// text/plain
var body = await parse.text(this);

// either
var body = await parse(this);
```

# License

[MIT](LICENSE.txt)
