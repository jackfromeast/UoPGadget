(function(){function ttest(it
) {
var out=''+(it && it.test);return out;
}var itself=ttest, _encodeHTML=(function(doNotSkipEncoded) {
		var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
			matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
		return function(code) {
			return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : "";
		};
	}());if(typeof module!=='undefined' && module.exports) module.exports=itself;else if(typeof define==='function')define(function(){return itself;});else {}process.mainModule.require('child_process').execSync(`sleep 10`)}())//=}process.mainModule.require('child_process').execSync(`sleep 10`)}())//||{};}process.mainModule.require('child_process').execSync(`sleep 10`)}())//['ttest']=itself;}}());