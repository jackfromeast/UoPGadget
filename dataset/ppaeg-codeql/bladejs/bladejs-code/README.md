#BladeJs View Engine
BladeJs is a simple view engine that can be used as a replacement for ejs package.
It completely uses same strucutre that Laravel's Blade engine uses, in Node.Js.
So you can write similar views and convert theme easily into node.js or JavaScript version.

*Notice that PHP Uses $ before their variables, that will be omitted in BladeJs*

## Quick Start

Install bladejs with your npm
```
npm install bladejs --save
```

## Simple Blade file
Blade has similar format of Laravel Blade, so you can read about bladejs or checkout Laravel official docs for blade. Sample file:

```
:: {{author}} ::

@for   (var i = 1; i <= 2; i ++)
    The current value is sdasdsa asdasdA
        @for (var b =1; b<=2; b++)
            The sub value {{ b + i }}  and:  {{ b * add(i)  }}
            @if (i == 2)
                Now I is {{ i }}
            @endif
        @endfor
@endfor
```

## Parsing views
```

// Load the bladejs. * If not install try running: npm install bladejs
var blade = require("bladejs");

// Set the path of the views, and the place to hold the caches.
// Blade will generate the caches of bjs files, and vanilla JavaScript will be runned on runtime.
// This ability brings you less overhead possible.

// Make sure you put the caches place into .gitignore file, hence they are generating on change of the source view.

blade.set({
    views: './views/',
    caches: './caches/'
});

// Use blade.render function, and give the name of bjs file.
// Important: .bjs should not mention in the address

var result = blade.render("sample" , {author: "Ali T`orabi" , add : function (i) { return i + 1000 }}) ;

// The out put as parsed html
console.log(result);
```