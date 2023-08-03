var specs = {};

specs.interpolation = [
  {
    "name": "No Interpolation",
    "desc": "Mustache-free templates should render as-is.",
    "data": {},
    "template": "Hello from {Mustache}!\n",
    "expected": "Hello from {Mustache}!\n"
  },
  {
    "name": "Basic Interpolation",
    "desc": "Unadorned tags should interpolate content into the template.",
    "data": {
      "subject": "world"
    },
    "template": "Hello, {{subject}}!\n",
    "expected": "Hello, world!\n"
  },
  {
    "name": "HTML Escaping",
    "desc": "Basic interpolation should be HTML escaped.",
    "data": {
      "forbidden": "& \" < >"
    },
    "template": "These characters should be HTML escaped: {{forbidden}}\n",
    "expected": "These characters should be HTML escaped: &amp; &quot; &lt; &gt;\n"
  },
  {
    "name": "Triple Mustache",
    "desc": "Triple mustaches should interpolate without HTML escaping.",
    "data": {
      "forbidden": "& \" < >"
    },
    "template": "These characters should not be HTML escaped: {{{forbidden}}}\n",
    "expected": "These characters should not be HTML escaped: & \" < >\n"
  },
  {
    "name": "Ampersand",
    "desc": "Ampersand should interpolate without HTML escaping.",
    "data": {
      "forbidden": "& \" < >"
    },
    "template": "These characters should not be HTML escaped: {{&forbidden}}\n",
    "expected": "These characters should not be HTML escaped: & \" < >\n"
  },
  {
    "name": "Basic Integer Interpolation",
    "desc": "Integers should interpolate seamlessly.",
    "data": {
      "mph": 85
    },
    "template": "\"{{mph}} miles an hour!\"",
    "expected": "\"85 miles an hour!\""
  },
  {
    "name": "Triple Mustache Integer Interpolation",
    "desc": "Integers should interpolate seamlessly.",
    "data": {
      "mph": 85
    },
    "template": "\"{{{mph}}} miles an hour!\"",
    "expected": "\"85 miles an hour!\""
  },
  {
    "name": "Ampersand Integer Interpolation",
    "desc": "Integers should interpolate seamlessly.",
    "data": {
      "mph": 85
    },
    "template": "\"{{&mph}} miles an hour!\"",
    "expected": "\"85 miles an hour!\""
  },
  {
    "name": "Basic Decimal Interpolation",
    "desc": "Decimals should interpolate seamlessly with proper significance.",
    "data": {
      "power": 1.21
    },
    "template": "\"{{power}} jiggawatts!\"",
    "expected": "\"1.21 jiggawatts!\""
  },
  {
    "name": "Triple Mustache Decimal Interpolation",
    "desc": "Decimals should interpolate seamlessly with proper significance.",
    "data": {
      "power": 1.21
    },
    "template": "\"{{{power}}} jiggawatts!\"",
    "expected": "\"1.21 jiggawatts!\""
  },
  {
    "name": "Ampersand Decimal Interpolation",
    "desc": "Decimals should interpolate seamlessly with proper significance.",
    "data": {
      "power": 1.21
    },
    "template": "\"{{&power}} jiggawatts!\"",
    "expected": "\"1.21 jiggawatts!\""
  },
  {
    "name": "Basic Context Miss Interpolation",
    "desc": "Failed context lookups should default to empty strings.",
    "data": {},
    "template": "I ({{cannot}}) be seen!",
    "expected": "I () be seen!"
  },
  {
    "name": "Triple Mustache Context Miss Interpolation",
    "desc": "Failed context lookups should default to empty strings.",
    "data": {},
    "template": "I ({{{cannot}}}) be seen!",
    "expected": "I () be seen!"
  },
  {
    "name": "Ampersand Context Miss Interpolation",
    "desc": "Failed context lookups should default to empty strings.",
    "data": {},
    "template": "I ({{&cannot}}) be seen!",
    "expected": "I () be seen!"
  },
  {
    "name": "Dotted Names - Basic Interpolation",
    "desc": "Dotted names should be considered a form of shorthand for sections.",
    "data": {
      "person": {
        "name": "Joe"
      }
    },
    "template": "\"{{person.name}}\" == \"{{#person}}{{name}}{{/person}}\"",
    "expected": "\"Joe\" == \"Joe\""
  },
  {
    "name": "Dotted Names - Triple Mustache Interpolation",
    "desc": "Dotted names should be considered a form of shorthand for sections.",
    "data": {
      "person": {
        "name": "Joe"
      }
    },
    "template": "\"{{{person.name}}}\" == \"{{#person}}{{{name}}}{{/person}}\"",
    "expected": "\"Joe\" == \"Joe\""
  },
  {
    "name": "Dotted Names - Ampersand Interpolation",
    "desc": "Dotted names should be considered a form of shorthand for sections.",
    "data": {
      "person": {
        "name": "Joe"
      }
    },
    "template": "\"{{&person.name}}\" == \"{{#person}}{{&name}}{{/person}}\"",
    "expected": "\"Joe\" == \"Joe\""
  },
  {
    "name": "Dotted Names - Arbitrary Depth",
    "desc": "Dotted names should be functional to any level of nesting.",
    "data": {
      "a": {
        "b": {
          "c": {
            "d": {
              "e": {
                "name": "Phil"
              }
            }
          }
        }
      }
    },
    "template": "\"{{a.b.c.d.e.name}}\" == \"Phil\"",
    "expected": "\"Phil\" == \"Phil\""
  },
  {
    "name": "Dotted Names - Broken Chains",
    "desc": "Any falsey value prior to the last part of the name should yield ''.",
    "data": {
      "a": {}
    },
    "template": "\"{{a.b.c}}\" == \"\"",
    "expected": "\"\" == \"\""
  },
  {
    "name": "Dotted Names - Broken Chain Resolution",
    "desc": "Each part of a dotted name should resolve only against its parent.",
    "data": {
      "a": {
        "b": {}
      },
      "c": {
        "name": "Jim"
      }
    },
    "template": "\"{{a.b.c.name}}\" == \"\"",
    "expected": "\"\" == \"\""
  },
  {
    "name": "Dotted Names - Initial Resolution",
    "desc": "The first part of a dotted name should resolve as any other name.",
    "data": {
      "a": {
        "b": {
          "c": {
            "d": {
              "e": {
                "name": "Phil"
              }
            }
          }
        }
      },
      "b": {
        "c": {
          "d": {
            "e": {
              "name": "Wrong"
            }
          }
        }
      }
    },
    "template": "\"{{#a}}{{b.c.d.e.name}}{{/a}}\" == \"Phil\"",
    "expected": "\"Phil\" == \"Phil\""
  },
  {
    "name": "Interpolation - Surrounding Whitespace",
    "desc": "Interpolation should not alter surrounding whitespace.",
    "data": {
      "string": "---"
    },
    "template": "| {{string}} |",
    "expected": "| --- |"
  },
  {
    "name": "Triple Mustache - Surrounding Whitespace",
    "desc": "Interpolation should not alter surrounding whitespace.",
    "data": {
      "string": "---"
    },
    "template": "| {{{string}}} |",
    "expected": "| --- |"
  },
  {
    "name": "Ampersand - Surrounding Whitespace",
    "desc": "Interpolation should not alter surrounding whitespace.",
    "data": {
      "string": "---"
    },
    "template": "| {{&string}} |",
    "expected": "| --- |"
  },
  {
    "name": "Interpolation - Standalone",
    "desc": "Standalone interpolation should not alter surrounding whitespace.",
    "data": {
      "string": "---"
    },
    "template": "  {{string}}\n",
    "expected": "  ---\n"
  },
  {
    "name": "Triple Mustache - Standalone",
    "desc": "Standalone interpolation should not alter surrounding whitespace.",
    "data": {
      "string": "---"
    },
    "template": "  {{{string}}}\n",
    "expected": "  ---\n"
  },
  {
    "name": "Ampersand - Standalone",
    "desc": "Standalone interpolation should not alter surrounding whitespace.",
    "data": {
      "string": "---"
    },
    "template": "  {{&string}}\n",
    "expected": "  ---\n"
  },
  {
    "name": "Interpolation With Padding",
    "desc": "Superfluous in-tag whitespace should be ignored.",
    "data": {
      "string": "---"
    },
    "template": "|{{ string }}|",
    "expected": "|---|"
  },
  {
    "name": "Triple Mustache With Padding",
    "desc": "Superfluous in-tag whitespace should be ignored.",
    "data": {
      "string": "---"
    },
    "template": "|{{{ string }}}|",
    "expected": "|---|"
  },
  {
    "name": "Ampersand With Padding",
    "desc": "Superfluous in-tag whitespace should be ignored.",
    "data": {
      "string": "---"
    },
    "template": "|{{& string }}|",
    "expected": "|---|"
  }
];

specs.sections = [
  {
    "name": "Truthy",
    "desc": "Truthy sections should have their contents rendered.",
    "data": {
      "boolean": true
    },
    "template": "\"{{#boolean}}This should be rendered.{{/boolean}}\"",
    "expected": "\"This should be rendered.\""
  },
  {
    "name": "Falsey",
    "desc": "Falsey sections should have their contents omitted.",
    "data": {
      "boolean": false
    },
    "template": "\"{{#boolean}}This should not be rendered.{{/boolean}}\"",
    "expected": "\"\""
  },
  {
    "name": "Context",
    "desc": "Objects and hashes should be pushed onto the context stack.",
    "data": {
      "context": {
        "name": "Joe"
      }
    },
    "template": "\"{{#context}}Hi {{name}}.{{/context}}\"",
    "expected": "\"Hi Joe.\""
  },
  {
    "name": "Deeply Nested Contexts",
    "desc": "All elements on the context stack should be accessible.",
    "data": {
      "a": {
        "one": 1
      },
      "b": {
        "two": 2
      },
      "c": {
        "three": 3
      },
      "d": {
        "four": 4
      },
      "e": {
        "five": 5
      }
    },
    "template": "{{#a}}\n{{one}}\n{{#b}}\n{{one}}{{two}}{{one}}\n{{#c}}\n{{one}}{{two}}{{three}}{{two}}{{one}}\n{{#d}}\n{{one}}{{two}}{{three}}{{four}}{{three}}{{two}}{{one}}\n{{#e}}\n{{one}}{{two}}{{three}}{{four}}{{five}}{{four}}{{three}}{{two}}{{one}}\n{{/e}}\n{{one}}{{two}}{{three}}{{four}}{{three}}{{two}}{{one}}\n{{/d}}\n{{one}}{{two}}{{three}}{{two}}{{one}}\n{{/c}}\n{{one}}{{two}}{{one}}\n{{/b}}\n{{one}}\n{{/a}}\n",
    "expected": "1\n121\n12321\n1234321\n123454321\n1234321\n12321\n121\n1\n"
  },
  {
    "name": "List",
    "desc": "Lists should be iterated; list items should visit the context stack.",
    "data": {
      "list": [
        {
          "item": 1
        },
        {
          "item": 2
        },
        {
          "item": 3
        }
      ]
    },
    "template": "\"{{#list}}{{item}}{{/list}}\"",
    "expected": "\"123\""
  },
  {
    "name": "Empty List",
    "desc": "Empty lists should behave like falsey values.",
    "data": {
      "list": []
    },
    "template": "\"{{#list}}Yay lists!{{/list}}\"",
    "expected": "\"\""
  },
  {
    "name": "Doubled",
    "desc": "Multiple sections per template should be permitted.",
    "data": {
      "bool": true,
      "two": "second"
    },
    "template": "{{#bool}}\n* first\n{{/bool}}\n* {{two}}\n{{#bool}}\n* third\n{{/bool}}\n",
    "expected": "* first\n* second\n* third\n"
  },
  {
    "name": "Nested (Truthy)",
    "desc": "Nested truthy sections should have their contents rendered.",
    "data": {
      "bool": true
    },
    "template": "| A {{#bool}}B {{#bool}}C{{/bool}} D{{/bool}} E |",
    "expected": "| A B C D E |"
  },
  {
    "name": "Nested (Falsey)",
    "desc": "Nested falsey sections should be omitted.",
    "data": {
      "bool": false
    },
    "template": "| A {{#bool}}B {{#bool}}C{{/bool}} D{{/bool}} E |",
    "expected": "| A  E |"
  },
  {
    "name": "Context Misses",
    "desc": "Failed context lookups should be considered falsey.",
    "data": {},
    "template": "[{{#missing}}Found key 'missing'!{{/missing}}]",
    "expected": "[]"
  },
  {
    "name": "Implicit Iterator - String",
    "desc": "Implicit iterators should directly interpolate strings.",
    "data": {
      "list": [
        "a",
        "b",
        "c",
        "d",
        "e"
      ]
    },
    "template": "\"{{#list}}({{.}}){{/list}}\"",
    "expected": "\"(a)(b)(c)(d)(e)\""
  },
  {
    "name": "Implicit Iterator - Integer",
    "desc": "Implicit iterators should cast integers to strings and interpolate.",
    "data": {
      "list": [
        1,
        2,
        3,
        4,
        5
      ]
    },
    "template": "\"{{#list}}({{.}}){{/list}}\"",
    "expected": "\"(1)(2)(3)(4)(5)\""
  },
  {
    "name": "Implicit Iterator - Decimal",
    "desc": "Implicit iterators should cast decimals to strings and interpolate.",
    "data": {
      "list": [
        1.1,
        2.2,
        3.3,
        4.4,
        5.5
      ]
    },
    "template": "\"{{#list}}({{.}}){{/list}}\"",
    "expected": "\"(1.1)(2.2)(3.3)(4.4)(5.5)\""
  },
  {
    "name": "Dotted Names - Truthy",
    "desc": "Dotted names should be valid for Section tags.",
    "data": {
      "a": {
        "b": {
          "c": true
        }
      }
    },
    "template": "\"{{#a.b.c}}Here{{/a.b.c}}\" == \"Here\"",
    "expected": "\"Here\" == \"Here\""
  },
  {
    "name": "Dotted Names - Falsey",
    "desc": "Dotted names should be valid for Section tags.",
    "data": {
      "a": {
        "b": {
          "c": false
        }
      }
    },
    "template": "\"{{#a.b.c}}Here{{/a.b.c}}\" == \"\"",
    "expected": "\"\" == \"\""
  },
  {
    "name": "Dotted Names - Broken Chains",
    "desc": "Dotted names that cannot be resolved should be considered falsey.",
    "data": {
      "a": {}
    },
    "template": "\"{{#a.b.c}}Here{{/a.b.c}}\" == \"\"",
    "expected": "\"\" == \"\""
  },
  {
    "name": "Surrounding Whitespace",
    "desc": "Sections should not alter surrounding whitespace.",
    "data": {
      "boolean": true
    },
    "template": " | {{#boolean}}\t|\t{{/boolean}} | \n",
    "expected": " | \t|\t | \n"
  },
  {
    "name": "Internal Whitespace",
    "desc": "Sections should not alter internal whitespace.",
    "data": {
      "boolean": true
    },
    "template": " | {{#boolean}} {{! Important Whitespace }}\n {{/boolean}} | \n",
    "expected": " |  \n  | \n"
  },
  {
    "name": "Indented Inline Sections",
    "desc": "Single-line sections should not alter surrounding whitespace.",
    "data": {
      "boolean": true
    },
    "template": " {{#boolean}}YES{{/boolean}}\n {{#boolean}}GOOD{{/boolean}}\n",
    "expected": " YES\n GOOD\n"
  },
  {
    "name": "Standalone Lines",
    "desc": "Standalone lines should be removed from the template.",
    "data": {
      "boolean": true
    },
    "template": "| This Is\n{{#boolean}}\n|\n{{/boolean}}\n| A Line\n",
    "expected": "| This Is\n|\n| A Line\n"
  },
  {
    "name": "Indented Standalone Lines",
    "desc": "Indented standalone lines should be removed from the template.",
    "data": {
      "boolean": true
    },
    "template": "| This Is\n  {{#boolean}}\n|\n  {{/boolean}}\n| A Line\n",
    "expected": "| This Is\n|\n| A Line\n"
  },
  {
    "name": "Standalone Line Endings",
    "desc": "\"\\r\\n\" should be considered a newline for standalone tags.",
    "data": {
      "boolean": true
    },
    "template": "|\r\n{{#boolean}}\r\n{{/boolean}}\r\n|",
    "expected": "|\r\n|"
  },
  {
    "name": "Standalone Without Previous Line",
    "desc": "Standalone tags should not require a newline to precede them.",
    "data": {
      "boolean": true
    },
    "template": "  {{#boolean}}\n#{{/boolean}}\n/",
    "expected": "#\n/"
  },
  {
    "name": "Standalone Without Newline",
    "desc": "Standalone tags should not require a newline to follow them.",
    "data": {
      "boolean": true
    },
    "template": "#{{#boolean}}\n/\n  {{/boolean}}",
    "expected": "#\n/\n"
  },
  {
    "name": "Padding",
    "desc": "Superfluous in-tag whitespace should be ignored.",
    "data": {
      "boolean": true
    },
    "template": "|{{# boolean }}={{/ boolean }}|",
    "expected": "|=|"
  }
];

specs.comments = [
  {
    "name": "Inline",
    "desc": "Comment blocks should be removed from the template.",
    "data": {},
    "template": "12345{{! Comment Block! }}67890",
    "expected": "1234567890"
  },
  {
    "name": "Multiline",
    "desc": "Multiline comments should be permitted.",
    "data": {},
    "template": "12345{{!\n  This is a\n  multi-line comment...\n}}67890\n",
    "expected": "1234567890\n"
  },
  {
    "name": "Standalone",
    "desc": "All standalone comment lines should be removed.",
    "data": {},
    "template": "Begin.\n{{! Comment Block! }}\nEnd.\n",
    "expected": "Begin.\nEnd.\n"
  },
  {
    "name": "Indented Standalone",
    "desc": "All standalone comment lines should be removed.",
    "data": {},
    "template": "Begin.\n  {{! Indented Comment Block! }}\nEnd.\n",
    "expected": "Begin.\nEnd.\n"
  },
  {
    "name": "Standalone Line Endings",
    "desc": "\"\\r\\n\" should be considered a newline for standalone tags.",
    "data": {},
    "template": "|\r\n{{! Standalone Comment }}\r\n|",
    "expected": "|\r\n|"
  },
  {
    "name": "Standalone Without Previous Line",
    "desc": "Standalone tags should not require a newline to precede them.",
    "data": {},
    "template": "  {{! I'm Still Standalone }}\n!",
    "expected": "!"
  },
  {
    "name": "Standalone Without Newline",
    "desc": "Standalone tags should not require a newline to follow them.",
    "data": {},
    "template": "!\n  {{! I'm Still Standalone }}",
    "expected": "!\n"
  },
  {
    "name": "Multiline Standalone",
    "desc": "All standalone comment lines should be removed.",
    "data": {},
    "template": "Begin.\n{{!\nSomething's going on here...\n}}\nEnd.\n",
    "expected": "Begin.\nEnd.\n"
  },
  {
    "name": "Indented Multiline Standalone",
    "desc": "All standalone comment lines should be removed.",
    "data": {},
    "template": "Begin.\n  {{!\n    Something's going on here...\n  }}\nEnd.\n",
    "expected": "Begin.\nEnd.\n"
  },
  {
    "name": "Indented Inline",
    "desc": "Inline comments should not strip whitespace",
    "data": {},
    "template": "  12 {{! 34 }}\n",
    "expected": "  12 \n"
  },
  {
    "name": "Surrounding Whitespace",
    "desc": "Comment removal should preserve surrounding whitespace.",
    "data": {},
    "template": "12345 {{! Comment Block! }} 67890",
    "expected": "12345  67890"
  }
];

specs.inverted = [
  {
    "name": "Falsey",
    "desc": "Falsey sections should have their contents rendered.",
    "data": {
      "boolean": false
    },
    "template": "\"{{^boolean}}This should be rendered.{{/boolean}}\"",
    "expected": "\"This should be rendered.\""
  },
  {
    "name": "Truthy",
    "desc": "Truthy sections should have their contents omitted.",
    "data": {
      "boolean": true
    },
    "template": "\"{{^boolean}}This should not be rendered.{{/boolean}}\"",
    "expected": "\"\""
  },
  {
    "name": "Context",
    "desc": "Objects and hashes should behave like truthy values.",
    "data": {
      "context": {
        "name": "Joe"
      }
    },
    "template": "\"{{^context}}Hi {{name}}.{{/context}}\"",
    "expected": "\"\""
  },
  {
    "name": "List",
    "desc": "Lists should behave like truthy values.",
    "data": {
      "list": [
        {
          "n": 1
        },
        {
          "n": 2
        },
        {
          "n": 3
        }
      ]
    },
    "template": "\"{{^list}}{{n}}{{/list}}\"",
    "expected": "\"\""
  },
  {
    "name": "Empty List",
    "desc": "Empty lists should behave like falsey values.",
    "data": {
      "list": []
    },
    "template": "\"{{^list}}Yay lists!{{/list}}\"",
    "expected": "\"Yay lists!\""
  },
  {
    "name": "Doubled",
    "desc": "Multiple inverted sections per template should be permitted.",
    "data": {
      "bool": false,
      "two": "second"
    },
    "template": "{{^bool}}\n* first\n{{/bool}}\n* {{two}}\n{{^bool}}\n* third\n{{/bool}}\n",
    "expected": "* first\n* second\n* third\n"
  },
  {
    "name": "Nested (Falsey)",
    "desc": "Nested falsey sections should have their contents rendered.",
    "data": {
      "bool": false
    },
    "template": "| A {{^bool}}B {{^bool}}C{{/bool}} D{{/bool}} E |",
    "expected": "| A B C D E |"
  },
  {
    "name": "Nested (Truthy)",
    "desc": "Nested truthy sections should be omitted.",
    "data": {
      "bool": true
    },
    "template": "| A {{^bool}}B {{^bool}}C{{/bool}} D{{/bool}} E |",
    "expected": "| A  E |"
  },
  {
    "name": "Context Misses",
    "desc": "Failed context lookups should be considered falsey.",
    "data": {},
    "template": "[{{^missing}}Cannot find key 'missing'!{{/missing}}]",
    "expected": "[Cannot find key 'missing'!]"
  },
  {
    "name": "Dotted Names - Truthy",
    "desc": "Dotted names should be valid for Inverted Section tags.",
    "data": {
      "a": {
        "b": {
          "c": true
        }
      }
    },
    "template": "\"{{^a.b.c}}Not Here{{/a.b.c}}\" == \"\"",
    "expected": "\"\" == \"\""
  },
  {
    "name": "Dotted Names - Falsey",
    "desc": "Dotted names should be valid for Inverted Section tags.",
    "data": {
      "a": {
        "b": {
          "c": false
        }
      }
    },
    "template": "\"{{^a.b.c}}Not Here{{/a.b.c}}\" == \"Not Here\"",
    "expected": "\"Not Here\" == \"Not Here\""
  },
  {
    "name": "Dotted Names - Broken Chains",
    "desc": "Dotted names that cannot be resolved should be considered falsey.",
    "data": {
      "a": {}
    },
    "template": "\"{{^a.b.c}}Not Here{{/a.b.c}}\" == \"Not Here\"",
    "expected": "\"Not Here\" == \"Not Here\""
  },
  {
    "name": "Surrounding Whitespace",
    "desc": "Inverted sections should not alter surrounding whitespace.",
    "data": {
      "boolean": false
    },
    "template": " | {{^boolean}}\t|\t{{/boolean}} | \n",
    "expected": " | \t|\t | \n"
  },
  {
    "name": "Internal Whitespace",
    "desc": "Inverted should not alter internal whitespace.",
    "data": {
      "boolean": false
    },
    "template": " | {{^boolean}} {{! Important Whitespace }}\n {{/boolean}} | \n",
    "expected": " |  \n  | \n"
  },
  {
    "name": "Indented Inline Sections",
    "desc": "Single-line sections should not alter surrounding whitespace.",
    "data": {
      "boolean": false
    },
    "template": " {{^boolean}}NO{{/boolean}}\n {{^boolean}}WAY{{/boolean}}\n",
    "expected": " NO\n WAY\n"
  },
  {
    "name": "Standalone Lines",
    "desc": "Standalone lines should be removed from the template.",
    "data": {
      "boolean": false
    },
    "template": "| This Is\n{{^boolean}}\n|\n{{/boolean}}\n| A Line\n",
    "expected": "| This Is\n|\n| A Line\n"
  },
  {
    "name": "Standalone Indented Lines",
    "desc": "Standalone indented lines should be removed from the template.",
    "data": {
      "boolean": false
    },
    "template": "| This Is\n  {{^boolean}}\n|\n  {{/boolean}}\n| A Line\n",
    "expected": "| This Is\n|\n| A Line\n"
  },
  {
    "name": "Standalone Line Endings",
    "desc": "\"\\r\\n\" should be considered a newline for standalone tags.",
    "data": {
      "boolean": false
    },
    "template": "|\r\n{{^boolean}}\r\n{{/boolean}}\r\n|",
    "expected": "|\r\n|"
  },
  {
    "name": "Standalone Without Previous Line",
    "desc": "Standalone tags should not require a newline to precede them.",
    "data": {
      "boolean": false
    },
    "template": "  {{^boolean}}\n^{{/boolean}}\n/",
    "expected": "^\n/"
  },
  {
    "name": "Standalone Without Newline",
    "desc": "Standalone tags should not require a newline to follow them.",
    "data": {
      "boolean": false
    },
    "template": "^{{^boolean}}\n/\n  {{/boolean}}",
    "expected": "^\n/\n"
  },
  {
    "name": "Padding",
    "desc": "Superfluous in-tag whitespace should be ignored.",
    "data": {
      "boolean": false
    },
    "template": "|{{^ boolean }}={{/ boolean }}|",
    "expected": "|=|"
  }
];

specs.delimiters = [
  {
    "name": "Pair Behavior",
    "desc": "The equals sign (used on both sides) should permit delimiter changes.",
    "data": {
      "text": "Hey!"
    },
    "template": "{{=<% %>=}}(<%text%>)",
    "expected": "(Hey!)"
  },
  {
    "name": "Special Characters",
    "desc": "Characters with special meaning regexen should be valid delimiters.",
    "data": {
      "text": "It worked!"
    },
    "template": "({{=[ ]=}}[text])",
    "expected": "(It worked!)"
  },
  {
    "name": "Sections",
    "desc": "Delimiters set outside sections should persist.",
    "data": {
      "section": true,
      "data": "I got interpolated."
    },
    "template": "[\n{{#section}}\n  {{data}}\n  |data|\n{{/section}}\n\n{{= | | =}}\n|#section|\n  {{data}}\n  |data|\n|/section|\n]\n",
    "expected": "[\n  I got interpolated.\n  |data|\n\n  {{data}}\n  I got interpolated.\n]\n"
  },
  {
    "name": "Inverted Sections",
    "desc": "Delimiters set outside inverted sections should persist.",
    "data": {
      "section": false,
      "data": "I got interpolated."
    },
    "template": "[\n{{^section}}\n  {{data}}\n  |data|\n{{/section}}\n\n{{= | | =}}\n|^section|\n  {{data}}\n  |data|\n|/section|\n]\n",
    "expected": "[\n  I got interpolated.\n  |data|\n\n  {{data}}\n  I got interpolated.\n]\n"
  },
  {
    "name": "Partial Inheritence",
    "desc": "Delimiters set in a parent template should not affect a partial.",
    "data": {
      "value": "yes"
    },
    "partials": {
      "include": ".{{value}}."
    },
    "template": "[ {{>include}} ]\n{{= | | =}}\n[ |>include| ]\n",
    "expected": "[ .yes. ]\n[ .yes. ]\n"
  },
  {
    "name": "Post-Partial Behavior",
    "desc": "Delimiters set in a partial should not affect the parent template.",
    "data": {
      "value": "yes"
    },
    "partials": {
      "include": ".{{value}}. {{= | | =}} .|value|."
    },
    "template": "[ {{>include}} ]\n[ .{{value}}.  .|value|. ]\n",
    "expected": "[ .yes.  .yes. ]\n[ .yes.  .|value|. ]\n"
  },
  {
    "name": "Surrounding Whitespace",
    "desc": "Surrounding whitespace should be left untouched.",
    "data": {},
    "template": "| {{=@ @=}} |",
    "expected": "|  |"
  },
  {
    "name": "Outlying Whitespace (Inline)",
    "desc": "Whitespace should be left untouched.",
    "data": {},
    "template": " | {{=@ @=}}\n",
    "expected": " | \n"
  },
  {
    "name": "Standalone Tag",
    "desc": "Standalone lines should be removed from the template.",
    "data": {},
    "template": "Begin.\n{{=@ @=}}\nEnd.\n",
    "expected": "Begin.\nEnd.\n"
  },
  {
    "name": "Indented Standalone Tag",
    "desc": "Indented standalone lines should be removed from the template.",
    "data": {},
    "template": "Begin.\n  {{=@ @=}}\nEnd.\n",
    "expected": "Begin.\nEnd.\n"
  },
  {
    "name": "Standalone Line Endings",
    "desc": "\"\\r\\n\" should be considered a newline for standalone tags.",
    "data": {},
    "template": "|\r\n{{= @ @ =}}\r\n|",
    "expected": "|\r\n|"
  },
  {
    "name": "Standalone Without Previous Line",
    "desc": "Standalone tags should not require a newline to precede them.",
    "data": {},
    "template": "  {{=@ @=}}\n=",
    "expected": "="
  },
  {
    "name": "Standalone Without Newline",
    "desc": "Standalone tags should not require a newline to follow them.",
    "data": {},
    "template": "=\n  {{=@ @=}}",
    "expected": "=\n"
  },
  {
    "name": "Pair with Padding",
    "desc": "Superfluous in-tag whitespace should be ignored.",
    "data": {},
    "template": "|{{= @   @ =}}|",
    "expected": "||"
  }
];

specs.partials = [
  {
    "name": "Basic Behavior",
    "desc": "The greater-than operator should expand to the named partial.",
    "data": {},
    "template": "\"{{>text}}\"",
    "partials": {
      "text": "from partial"
    },
    "expected": "\"from partial\""
  },
  {
    "name": "Failed Lookup",
    "desc": "The empty string should be used when the named partial is not found.",
    "data": {},
    "template": "\"{{>text}}\"",
    "partials": {},
    "expected": "\"\""
  },
  {
    "name": "Context",
    "desc": "The greater-than operator should operate within the current context.",
    "data": {
      "text": "content"
    },
    "template": "\"{{>partial}}\"",
    "partials": {
      "partial": "*{{text}}*"
    },
    "expected": "\"*content*\""
  },
  {
    "name": "Recursion",
    "desc": "The greater-than operator should properly recurse.",
    "data": {
      "content": "X",
      "nodes": [
        {
          "content": "Y",
          "nodes": []
        }
      ]
    },
    "template": "{{>node}}",
    "partials": {
      "node": "{{content}}<{{#nodes}}{{>node}}{{/nodes}}>"
    },
    "expected": "X<Y<>>"
  },
  {
    "name": "Surrounding Whitespace",
    "desc": "The greater-than operator should not alter surrounding whitespace.",
    "data": {},
    "template": "| {{>partial}} |",
    "partials": {
      "partial": "\t|\t"
    },
    "expected": "| \t|\t |"
  },
  {
    "name": "Inline Indentation",
    "desc": "Whitespace should be left untouched.",
    "data": {
      "data": "|"
    },
    "template": "  {{data}}  {{> partial}}\n",
    "partials": {
      "partial": ">\n>"
    },
    "expected": "  |  >\n>\n"
  },
  {
    "name": "Standalone Line Endings",
    "desc": "\"\\r\\n\" should be considered a newline for standalone tags.",
    "data": {},
    "template": "|\r\n{{>partial}}\r\n|",
    "partials": {
      "partial": ">"
    },
    "expected": "|\r\n>|"
  },
  {
    "name": "Standalone Without Previous Line",
    "desc": "Standalone tags should not require a newline to precede them.",
    "data": {},
    "template": "  {{>partial}}\n>",
    "partials": {
      "partial": ">\n>"
    },
    "expected": "  >\n  >>"
  },
  {
    "name": "Standalone Without Newline",
    "desc": "Standalone tags should not require a newline to follow them.",
    "data": {},
    "template": ">\n  {{>partial}}",
    "partials": {
      "partial": ">\n>"
    },
    "expected": ">\n  >\n  >"
  },
  {
    "name": "Standalone Indentation",
    "desc": "Each line of the partial should be indented before rendering.",
    "data": {
      "content": "<\n->"
    },
    "template": "\\\n {{>partial}}\n/\n",
    "partials": {
      "partial": "|\n{{{content}}}\n|\n"
    },
    "expected": "\\\n |\n <\n->\n |\n/\n"
  },
  {
    "name": "Padding Whitespace",
    "desc": "Superfluous in-tag whitespace should be ignored.",
    "data": {
      "boolean": true
    },
    "template": "|{{> partial }}|",
    "partials": {
      "partial": "[]"
    },
    "expected": "|[]|"
  }
];

