# mote.js

Mote.js is a spec-compliant, fast implementation of [mustache][mu] templates.

For more information, check out the [mote site][mote].

[mu]: http://mustache.github.com/
[mote]: http://satchmorun.github.com/mote

## Installation

Via Node, it's as you'd expect:

    npm install mote

## For crying out loud, why?

Mote began its life as an exercise. I was experimenting with [Handlebars][hb]
and [dust][du], Twitter had just released [hogan][ho], and I thought it would
be fun to write a mustache implementation.

I got it working, then set about trying to make it fast. I didn't think I could
be competitive with the existing libraries, but I tried anyway. After all, this
was just supposed to be a toy.

Much to my surprise, it ended up being really fast.

[spec]: https://github.com/mustache/spec
[mujs]: https://github.com/janl/mustache.js/
[hb]: http://handlebarsjs.com/
[ho]: http://twitter.github.com/hogan.js/
[du]: http://akdubya.github.com/dustjs/

## Roadmap

- utilities for server-side compilation
- documentation

