# mote

Mote.js is a spec-compliant, fast implementation of [mustache][mu] templates.
See how it compares to the other popular engines by clicking the "bench" link
in the menu.

# mustache?

See the [mustache manual][man] for more information about the mustache
templating language.

Mote is fully compliant with all the required parts of the [mustache
spec,][spec] with the exception of the optional lambda functionality.

Mote has lambda support, but it works a little differently from the spec. For
more, check out the docs.

# motivation

Mote began its life as an exercise. I was experimenting with [Handlebars][hb]
and [dust][du], Twitter had just released [hogan][ho], and I thought it would
be fun to write a mustache implementation.

I got it working, then set about trying to make it fast. I didn't think I could
be competitive with the existing libraries, but I tried anyway. After all, this
was just supposed to be a toy.

Much to my surprise, it ended up being really fast.

# license

Mote is MIT-licensed.

[spec]: https://github.com/mustache/spec
[mujs]: https://github.com/janl/mustache.js/
[hb]: http://handlebarsjs.com/
[ho]: http://twitter.github.com/hogan.js/
[du]: http://akdubya.github.com/dustjs/
[mu]: http://mustache.github.com
[man]: http://mustache.github.com/mustache.5.html

