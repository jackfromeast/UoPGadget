/* Copyright (c) Royal Holloway, University of London | Contact Blake Loring (blake@parsed.uk), Duncan Mitchell (Duncan.Mitchell.2015@rhul.ac.uk), or Johannes Kinder (johannes.kinder@rhul.ac.uk) for details or support | LICENSE.md for license details */

/*global J$*/

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT
//
// Symbolic execution analyser entry point

import SymbolicExecution from "./symbolic-execution";
import Config from "./config";
import Log from "./utilities/log";
import External from "./external";

const fs = External.load("fs");
const process = External.load("process");

// const withHelper = process.argv[process.argv.length - 5];
// const withChain = process.argv[process.argv.length - 4];
const input = process.argv[process.argv.length - 3];
const undefinedUnderTest = process.argv[process.argv.length - 2];
const inherit = process.argv[process.argv.length - 1];

Log.logHigh("Built with VERY logging enabled");
Log.logMid("Built with FINE logging enabled");
Log.log("Built with BASE logging enabled");
Log.log("Intial Input " + input);

process.title = "expoSE+ worker";

process.on("disconnect", function() {
	Log.log("Premature termination - Parent exit");
	process.exit();
});



J$.analysis = new SymbolicExecution(J$, JSON.parse(input), JSON.parse(undefinedUnderTest), JSON.parse(inherit), (state, coverage) => {

	// We record the alternatives list as the results develop to make the output tool more resilient to SMT crashes
	state.alternatives((current) => {
		const finalOut = {
			pc: state.finalPC(),
			pcString: state.finalPC().toString(),
			input: state.input,
			errors: state.errors,
			alternatives: current,
			undefinedPool: state.undefinedPool,
			undefinedUT: state.undefinedUnderTest,
			helperPool: state.retHelper? state.helperCandidates: [],
			successHelper: (state.withHelper && !state.retHelper)? state.withHelper: undefined,
			forinLoad: state.forinLoad,
			stats: state.stats.export(),
			result: state.result
		};

		if (Config.outFilePath) {
			fs.writeFileSync(Config.outFilePath, JSON.stringify(finalOut));
			Log.log("Wrote final output to " + Config.outFilePath);
		} else {
			Log.log("No final output path supplied");
		}
	});
	
	Log.logPC("Finished play with PC " + state.pathCondition.map(x => x.ast));

	if (Config.outCoveragePath) {
		fs.writeFileSync(Config.outCoveragePath, JSON.stringify(coverage.end()));
		Log.log("Wrote final coverage to " + Config.outCoveragePath);
	} else {
		Log.log("No final coverage path supplied");
	}
});
