import os from "os";
import { ArgumentParser } from "argparse";

function timeFrom(val) {
	const SECOND = 1000;
	const MINUTE = SECOND * 60;
	const HOUR = MINUTE * 60;

	function timeToMS(timeString) {
		const suffix = timeString[timeString.length - 1];

		if (suffix === "s") {
			return SECOND * Number.parseInt(timeString.slice(0, -1));
		} else if (suffix === "m") {
			return MINUTE * Number.parseInt(timeString.slice(0, -1));
		} else if (suffix === "h") {
			return HOUR * Number.parseInt(timeString.slice(0, -1));
		} else {
			return Number.parseInt(timeString);
		}
	}

	return timeToMS(val);
}

const parser = new ArgumentParser({
	description: "Configuration for ExpoSE",
});

parser.addArgument("--max-concurrent", {
	dest: "max_concurrent",
	type: "int",
	defaultValue: os.cpus().length * 2,
	action: "store",
	help: "max number of tests to run concurrently",
});

parser.addArgument("--timeout", {
	dest: "timeout",
	type: "string",
	defaultValue: "5h",
	action: "store",
	help: "maximum time for the tests",
});

parser.addArgument("--undef-per-timeout", {
	dest: "undef_per_timeout",
	type: "string",
	defaultValue: "20m",
	action: "store",
	help: "timeout for individual undefined properties",
});

parser.addArgument("--undef-per-withhelper-timeout", {
	dest: "withhelper_timeout",
	type: "string",
	defaultValue: "1m",
	action: "store",
	help: "timeout for individual undefined properties tested with helper",
});

parser.addArgument("--per-timeout", {
	dest: "per_timeout",
	type: "string",
	defaultValue: "20m",
	action: "store",
	help: "timeout for individual tests",
});

parser.addArgument("--test-strategy", {
	dest: "test_strategy",
	type: "string",
	defaultValue: "default",
	action: "store",
	help: "test strategy to use",
});

parser.addArgument("--test-order", {
	dest: "test_strategy",
	type: "string",
	defaultValue: "backward",
	action: "store",
	help: "test strategy to use",
});

parser.addArgument("--json-path", {
	dest: "json_path",
	type: "string",
	defaultValue: undefined,
	action: "store",
	help: "path to store JSON output",
});

parser.addArgument("--print-paths", {
	dest: "print_paths",
	type: "int",
	defaultValue: 1,
	action: "store",
	help: "print error paths to stdout",
});

parser.addArgument("--print-coverage", {
	dest: "print_coverage",
	type: "int",
	defaultValue: false,
	action: "store",
	help: "print delta coverage information",
});

parser.addArgument("--print-pc", {
	dest: "print_pc",
	type: "int",
	defaultValue: false,
	action: "store",
	help: "print path condition",
});

parser.addArgument("--case-coverage", {
	dest: "case_coverage",
	type: "int",
	defaultValue: false,
	action: "store",
	help: "print per-case coverage information",
});

parser.addArgument("--play-script", {
	dest: "play_script",
	type: "string",
	defaultValue: "./scripts/play",
	action: "store",
	help: "path to the play script",
});

parser.addArgument("--undefined-file", {
	dest: "undefined_file",
	type: "string",
	defaultValue: undefined,
	action: "store",
	help: "the initial undefined properties",
});

parser.addArgument("--undefined-utq", {
	dest: "undefined_utq",
	type: "string",
	defaultValue: undefined,
	action: "store",
	help: "the undefined properties under testing",
});

parser.addArgument("--chain", {
	dest: "chainProp",
	defaultValue: false,
	action: "storeTrue",
	help: "whether test chain undefined prop to the queue",
});

parser.addArgument("--chainLayer", {
	dest: "chainLayer",
	defaultValue: 1,
	action: "store",
	help: "whether combined each 2 undefined properties in the inital pool",
});

parser.addArgument("--patch", {
	dest: "helperProp",
	defaultValue: false,
	action: "storeTrue",
	help: "whether test patching undefined prop to the queue",
});

parser.addArgument("--z3", {
	dest: "z3_lib",
	type: "string",
	action: "store",
	defaultValue: "/home/ubuntu/PPAEG/expoSE+/node_modules/z3javascript/bin/libz3.so",
	help: "the path to z3 lib",
});

// positional arguments
parser.addArgument("test-file", {
	type: "string",
	defaultValue: undefined,
	action: "store",
	help: "the path to the test file",
});

// positional arguments
parser.addArgument("--input", {
	dest: "init_input",
	type: "string",
	defaultValue: undefined,
	action: "store",
	help: "the initial input to the test file",
});


const args = parser.parseArgs();

export default {
	maxConcurrent: args.max_concurrent,
	maxTime: timeFrom(args.timeout),
	undefMaxTime: timeFrom(args.undef_per_timeout),
	testMaxTime: timeFrom(args.per_timeout),
	withHelperMaxTime: timeFrom(args.withhelper_timeout),
	testStrategy: args.test_strategy,
	testOrder: args.test_order,
	jsonOut: args.json_path,
	printPaths: args.print_paths,
	printDeltaCoverage: args.print_coverage,
	printPathCondition: args.print_pc,
	perCaseCoverage: args.case_coverage,
	analyseScript: args.play_script,
	undefinedFile: args.undefined_file,
	undefinedUTQ: args.undefined_utq,
	chainProp: args.chainProp,
	chainLayer: args.chainLayer,
	helperProp: args.helperProp,
	z3: args.z3_lib,
	input: args.init_input,
};


/* Copyright (c) Royal Holloway, University of London | Contact Blake Loring (blake@parsed.uk), Duncan Mitchell (Duncan.Mitchell.2015@rhul.ac.uk), or Johannes Kinder (johannes.kinder@rhul.ac.uk) for details or support | LICENSE.md for license details */

// const os = require("os");

// function argToType(arg, type) {
// 	return type === "number" ? parseInt(arg) : arg;
// }

// function getArgument(name, type, dResult) {
// 	return process.env[name] ? argToType(process.env[name], type) : dResult;
// }

// function maxConcurrent() {
// 	const defaultCpuCores = os.cpus().length;
// 	const fromArgOrDefault = getArgument("EXPOSE_MAX_CONCURRENT", "number", defaultCpuCores);
// 	return fromArgOrDefault;
// }

// function timeFrom(envArg, defaultVal) {
// 	const SECOND = 1000;
// 	const MINUTE = SECOND * 60;
// 	const HOUR = MINUTE * 60;

// 	function timeToMS(timeString) {
// 		const suffix = timeString[timeString.length - 1];

// 		if (suffix === "s") {
// 			return SECOND * Number.parseInt(timeString.slice(0, -1));
// 		} else if (suffix === "m") {
// 			return MINUTE * Number.parseInt(timeString.slice(0, -1));
// 		} else if (suffix === "h") {
// 			return HOUR * Number.parseInt(timeString.slice(0, -1));
// 		} else {
// 			return Number.parseInt(timeString);
// 		}
// 	}

// 	return timeToMS(getArgument(envArg, "string", defaultVal));
// }

// export default {
// 	maxConcurrent: maxConcurrent(), //max number of tests to run concurrently
// 	maxTime: timeFrom("EXPOSE_MAX_TIME", "2h"),
// 	testMaxTime: timeFrom("EXPOSE_TEST_TIMEOUT", "40m"),
// 	testStrategy: getArgument("EXPOSE_TEST_STRATEGY", "string", "default"),
// 	jsonOut: getArgument("EXPOSE_JSON_PATH", "string", undefined), //By default ExpoSE does not generate JSON out
// 	printPaths: getArgument("EXPOSE_PRINT_PATHS", "number", false), //By default do not print paths to stdout
// 	printDeltaCoverage: getArgument("EXPOSE_PRINT_COVERAGE", "number", false),
// 	printPathCondition: getArgument("EXPOSE_PRINT_PC", "number", false),
// 	perCaseCoverage: getArgument("EXPOSE_CASE_COVERAGE", "number", false), /* Prints coverage information on the finished path */
// 	analyseScript: getArgument("EXPOSE_PLAY_SCRIPT", "string", "./scripts/play")
// };
