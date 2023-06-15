/**
 * Test for || operator
 * 
 */

const { footerSources } = require("../../jalangi2/src/js/footers");
var S$ = require('S$');

var prop = "helloworld";

// TEST 1
var x = prop || "default";

if (x === "helloworld") {
    console.log("TEST1 PASSED: this is the right branch");
}
else {
    console.log("this is the wrong branch");
}

// TEST 2
var y = undefined || x || "default";

if (y === "helloworld") {
    console.log("TEST2 PASSED: this is the right branch");
}

// TEST 3
var foo = {
    foo1: function() {
        console.log("foo1");
        return false;
    },

    foo2: function() {
        console.log("foo2");
        return false;
    },

    foo3: function() {
        console.log("foo3");
        return false;
    },

    call_foo: function() {
        return (
            this.foo1() ||
            this.foo2() ||
            this.foo3() 
        );
    }
};

foo.call_foo();

// TEST 4
var sym = S$.pureSymbol('sym');

if (sym == 'helloworld'){
    // let y = undefined || sym || "default";
    let y = undefined || "default" || sym;
    if (y === "helloworld") {
        console.log("TEST4 PASSED: this is the right branch");
        new Function("", y);
    }
}