var S$ = require('S$');
var x = S$.symbol("int_sym", 1);

if (x+'1' === '11') {
	throw 'Reachable';
}
