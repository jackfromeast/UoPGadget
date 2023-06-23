/**
 * This is the entry point of the frontend
 */
import Center from "./center";
import Config from "./config";

process.title = "expoSE+ frontend";

process.on("disconnect", function() {
	console.log("Premature termination - Parent exit");
	process.exit();
});

if (process.argv.length >= 3) {
 
	let target = process.argv[process.argv.length - 1];
	let initialInput = undefined;

	if(Config.input){
		initialInput = JSON.parse(Config.input);
	}

	console.log(`[+] ExpoSE ${target} concurrent: ${Config.maxConcurrent} timeout: ${Config.maxTime} per-undefined: ${Config.undefMaxTime} per-test: ${Config.testMaxTime}`);

	const center = new Center();

	process.on("SIGINT", function() { /** nice catch for sigint */
		center.cancel();
	});

	const maxTimeout = setTimeout(function() {
		center.cancel();
	}, Config.maxTime);

	center.start(target, initialInput); /** this is synchronous */

	clearTimeout(maxTimeout);
} else {
	console.log(`USAGE: ${process.argv[0]} ${process.argv[1]} target (Optional: initial input)`);
}
