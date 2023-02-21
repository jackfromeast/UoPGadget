var fs = require("fs");



// Read lines one by one, start translate into javascript

var lines = [];

// Adds the nodjs view equipments

// The level of code nesting in current line
var nestedLevel = 0;


var core = {

    /**
     * Holds the parsed values
     */
    lines: [],


    /**
     * Holds the patterns required to parse bjs files
     */
    patterns: {
        findStart: /@([a-zA-Z][0-9a-zA-Z]+)(.*)/,
        findEnd : /^\s*@([a-zA-Z][0-9a-zA-Z]+)\s*$/,
        inlineEcho: /\{\{(.+?)\}\}/g
    },


    /**
     * Prepares the view to be saved as .bjs.js
     * @returns {string}
     */
    prepareExport: function () {

        var viewbagParser = `
        	
for (var i in viewBag) {
	switch (typeof viewBag[i]) {
		case "function":
			var s = "var " + i + " = " + viewBag[i];
			eval(s); 
		break;
		default: 
			var s = "var " + i + " = \`" + viewBag[i].replace(/\`/g , "\\\\\`") + "\`";
        eval(s); 
        break;


    }
}`;
        string = this.lines.join("\n\t");
        return `module.exports = function (viewBag) { ${viewbagParser} \n var T = ''; \n\t${string}\n\t return T; \n}`;
    },


    /**
     * Writes the converted value into js files, with formatting the nested level
     * @param data
     */
    writeInJS: function (data) {
        this.lines.push('	'.repeat(nestedLevel) + data);
    },

    /**
     * Parses and generates bjs.js file line by line
     * @param inputBJSLines array of input view lines
     */

    linesParser: function (inputBJSLines) {


        inputBJSLines.forEach(line => {

            var matchStart = line.match(this.patterns.findStart);
            var matchEnd = line.match(this.patterns.findEnd);

            if (matchStart && matchStart[0].substr(0,4) != "@end") {

                this.writeInJS(`${matchStart[1]}  ${matchStart[2]}  {`);
                nestedLevel++;
            } else if (matchEnd) {
                if (matchEnd[1].substr(0, 3) == "end") {
                    nestedLevel--;
                    this.writeInJS('}');

                }

            } else {

                line = this.parseInlineValues(line);
                this.writeInJS(`T += \`${line}
\`;`);
            }

        });
        return this.prepareExport()
    },



    parseInlineValues: function (line) {
        var line = line.replace(this.patterns.inlineEcho , function (a , b , c) {
          return `\` + ${b} + \``;
        });
        return line;
    }
}


module.exports = {

    catalog: {
        views: './views/',
        caches: './caches/'
    },

    /**
     * Creates bjs.js file from a bjs view, and stores in the path
     * @param filename
     * @param data
     */
    create: function (filename) {
        var data = fs.readFileSync(this.catalog.views + filename).toString().split("\n");
        var exportx = core.linesParser(data);

        fs.writeFileSync(this.catalog.caches + filename + ".js" ,exportx );
    },

    /**
     * Renders a bjs. if exists in cache, runs that, otherwise will create and render
     * @param filename
     * @param data
     */
    render: function (filename , data) {
        filename += ".bjs";
        if (!this.isCached()) {
            this.create(filename);
        }
        return require(this.catalog.caches + filename + ".js")(data);
    },


    isCached: function (filename) {
       // return false;
        if (fs.existsSync (this.catalog.views + filename)) {
            return true;
        }
        return false;
    },

    /**
     * Sets the catalog data, like view path and caches directory
     * @param data
     */
    set: function (data) {
        this.catalog = data;
    }


}