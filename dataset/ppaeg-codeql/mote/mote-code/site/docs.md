# installation

For node.js, use [npm][npm]:

    npm install node

For the browser, just download mote and include it in your page.

```html
<script src="path/to/mote.js"></script>
```

[npm]: http://npmjs.org

# usage

Compile your template into a JavaScript function with `mote.compile`, and then
call that function with your data:

```javascript
var greet = mote.compile('Greetings, {{name}}.');
greet({name: 'Arthur Dent'}); //=> 'Greetings, Arthur Dent.'
```

# variables

Variable tags are used for simple interpolation, like in the example above. If
the property doesn't exist, you get back the empty string:

```javascript
var nothing = mote.compile('{{nothing}}')
  , data = {};

nothing(data); //=> ''
```

By default, variable tags are HTML-escaped. To bypass the escaping, use
triple-staches `{{{ ... }}}` or an ampersand `{{& ... }}`:

```javascript
var normal = mote.compile('escaped: {{data}}')
  , triple = mote.compile('triple: {{{data}}}')
  , ampersand = mote.compile('ampersand: {{&data}}')
  , data = {data: '& " < >'};

normal(data);    //=> 'escaped: &amp; &quot; &lt; &gt;'
triple(data);    //=> 'triple: & " < >'
ampersand(data); //=> 'ampersand: & " < >'
```

Mote supports the dot syntax for deep lookups:

```javascript
var lookup = mote.compile('{{a.b.c}}')
  , data = {a: {b: {c: '42'}}};

lookup(data); //=> '42'
```

If a variable tag points to a function, mote will call it in the context of the
object passed in and interpolate the result:

```javascript
var lookupFn = mote.compile('answer: {{getAnswer}}')
  , data = {
      answer: 42,
      getAnswer: function() {
        return this.answer;
      }
    };

lookupFn(data); //=> 'answer: 42'
```

# sections

Section tags render the enclosed block zero or more times, depending on the
value of the key in the passed-in context. They start with a hash and end with
a slash: `{{#key}}{{/key}}`.

If the key evaluates to a falsy value, the block isn't rendered:

```javascript
var empty = mote.compile('{{#nope}}Will you render me?{{/nope}}')
  , data = {};

empty(data); //=> ''
```

If the key evaluates to a truthy value, its value will be pushed onto the
lookup stack and the block will be rendered once:

```javascript
var once = mote.compile('{{#yep}}The answer is: {{answer}}{{/yep}}')
  , data = {yep: {answer: 42}};

once(data); //=> 'The answer is: 42'
```

If the key evaluates to an array, the block will be rendered once for each item
in the array, with that item's value on top of the context stack. You can use
`{{.}}` to get at the value of the current item:

```javascript
var many = mote.compile('{{#potatoes}}{{.}} potato, {{/potatoes}}4.')
  , data = {potatoes: [1, 2, 3]};

many(data); //=> '1 potato, 2 potato, 3 potato, 4.'
```

If the key evaluates to a function, mote will call it in the context of the
data object, passing it a function that renders the block. It will then
interpolate the result of calling the key function. That's a weird glob of
words, probably easier to just look at an example:

```javascript
var keyFn = mote.compile('{{#lambda}}Hello, {{name}}.{{/lambda}}')
  , data = {
      name: 'Arthur Dent',
      lambda: function(fn) {
        return fn() + ' ' + fn().toUpperCase();
      }
    };

keyFn(data); //=> 'Hello, Arthur Dent. HELLO, ARTHUR DENT.'
```

# inverted sections

Inverted sections start with a caret and end with a slash:
`{{^invert}}{{/invert}}`. They render their blocks zero or one time(s). If the
key evaluates to a falsy value, the block renders, otherwise not:

```javascript
var emptyverted = mote.compile('{{^nope}}Will you render me?{{/nope}}')
  , data = {};

emptyverted(data); //=> 'will you render me?'
```

# existence sections

Existence sections start with a question mark and end with a slash:
`{{?huh}}{{/huh}}`. This tag isn't in the mustache spec, but it can be
convenient. It is the inverse of an inverted section: if the key evaluates to
truthy, it renders the block once pushing the key's value onto the lookup
stack, otherwise not at all.

It's most common use is to generate tags surrounding lists:

```javascript
var list = mote.compile(
  '{{?items}}' +
  '<ul>' +
  '{{#items}}<li>{{.}}</li>{{/items}}' +
  '</ul>' +
  '{{/items}}'
);

list({items: []});
//=> ''
list({items: ['Arthur', 'Ford']});
//=> '<ul><li>Arthur<li><li>Ford</li></ul>'
```

# comments

Comment tags are just ignored when rendering. They look like: `{{! this is
a comment !}}`.

The bang before the closing tag is optional.

```javascript
var comment = mote.compile('{{! Listen to what I have to say!! !}}')
  , data = {};

comment({}); //=> ''
```

# partials

Partials are a way to factor out bits of your templates into other templates.
Another way to write the list example from above (in the existence section)
would be:

```javascript
mote.compilePartial('list_item', '{{#.}}<li>{{.}}</li>{{/.}}');
var list = mote.compile(
  '{{?items}}' +
  '<ul>' +
  '{{> list_item}}' +
  '</ul>' +
  '{{/items}}'
);

list({items: ['Arthur', 'Ford']});
//=> '<ul><li>Arthur<li><li>Ford</li></ul>'
```

First, note that partials need to be compiled using `mote.compilePartial`,
which takes the name that will later be used to lookup the partial.

Secondly, there's a little bit of trickery in the partial using '.' as the
section key. The reason this works is that the existence section tag pushes its
value onto the top of the lookup stack, and the '.' key always refers to the
top of the stack. So the first '.' refers to the `items` array itself, and
inside its section, the '.' refers to each item in the `items` array.

