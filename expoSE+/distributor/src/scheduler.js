/**
 * This file is used to schedule the multiple running tests given a (group of) undefined property under testing
 */
const EventEmitter = require("events");
import Spawn from "./spawn";
import Strategy from "./strategies/deterministic";
import Coverage from "./coverage-aggregator";
import Stats from "../../lib/Stats/bin/main";
import Log from "./log";
import Undef from "./undefined";
import Config from "./config";
import JsonWriter from "./json-writer";
import path from "path";
import fs from "fs";
import CoverageMap from "./coverage-map";
import isInternal from "./internal";

class Scheduler extends EventEmitter{

	constructor(propUnderTest) {
		super();

		this.cbs = [];
		this._cancelled = false;
		this.options = Config;

		this._lastid = 0;
		this._done = [];
		this._errors = 0;
		this._running = [];
		this.undefinedPool = new Undef.UndefinedPool(this.options.undefinedFile);

		this._coverage = new Coverage();
		this._stats = new Stats();

		/**
         * propUnderTest could be empty
         * meaning the symbolic variables are defined in the test file itself
         */
		this.undefinedUT = propUnderTest.props;
		this.withHelper = propUnderTest.withHelper;
		this.withChain = propUnderTest.withChain;
		this.input = propUnderTest.initialInput;
		this.forinLoad = false;

		this.helperPool = new Undef.UndefinedPool();

		/** initialized in start method */
		this.timeout = null;
		this.starttime = null;
		this.file = null;
		this.baseInput = null;

		this.success = 0;
	}

	start(file, baseInput) {
		this.file = file;
		this.baseInput = baseInput;
		this.starttime = (new Date()).getTime();

		this._startTesting([{
			id: this._nextID(),
			path: file,
			input: this.input || baseInput || { _bound: 0 },		/** baseInput is the input passed from the commandline */
			undefinedUT: this.undefinedUT,
			forinLoad: this.forinLoad,
		}]);

		this.timeout =setTimeout(() => {            
			this.cancel();
		}, this.options.undefMaxTime);

		return this;
	}
    
	/**
	 * It won't cancel all the running test immediately
	 * It will wait for the current test to finish
	 * 
	 * Due to the fact that _testFileDone callback is synchronous
	 * So it will take time to process the result of each test
	 */
	cancel() {
		this._cancelled = true;
		this._running.forEach(test => test.kill());
		// this._finishedTesting();
	}

	addCb(cb) {
		this.cbs.push(cb);
		return this;
	}

	_startTesting(cases) {
		this._strategy = new Strategy();
		cases.forEach(i => this._strategy.add(i));

		this._requeue();
		this._printUndefined();
		this._printStatus();
	}

	/**
     * Queue as many tests as possible
     * 
     * This function seves as synchronization point for the scheduler
     */
	_requeue() {
		while (this._strategy.length() && this._canStart()) {
			this._startNext();
		}
	}

	/**
     * If there is a slot & under max paths start an additional test
     */
	_startNext() {
		if (this._strategy.length()) {
			this._testFile(this._strategy.next());
		}
	}

	/**
     * True if another test can begin
     */
	_canStart() {
		return !this._cancelled && this._running.length < this.options.maxConcurrent;
	}

	_remove(test) {
		const idx = this._running.indexOf(test);
		if (idx != -1) {
			this._running.splice(idx, 1);
		}
	}

	_postTest(test) {
		this._remove(test);

		// Start any remaining queued
		this._requeue();

		this._printStatus();
		this._printNewUndefined();

		// If the test has completed, exit the current scheduler
		if (!this._running.length) {
			clearTimeout(this.timeout);
			this._finishedTesting();
		}
	}

	/**
     * Exit point of the scheduler
     * being called when
     * 1/ complete: no more tests to run
     * 2/ timeout:  received a cancel signal from the center
     * 
     * `done` event emittion has been explicitly implemented 1/ cancel func 2/ _postTest func
     */
	_finishedTesting() {
		// call all the callbacks
		this.cbs.forEach(cb => cb(this, this._done, this._errors, this._coverage, this._stats.final(), this.undefinedPool.getUpdatedMap()));

		// summary
		this._summary();

		// emit done event
		this.emit("done", this.undefinedUT, this.undefinedPool.getUpdatedMap(), this.helperPool.getUndefinedPool(), this.success);
	}

	_nextID() {
		return this._lastid++;
	}

	_countVal(input, value) {
		let count = 0;
		for (let key of Object.keys(input)) {
			if (key.endsWith("_t") && input[key] === value) {
				count++;
			}
		}
		return count;
	}

	/**
	 * Sort the child input by the number of undefined, string type symbols
	 * We want to prioritize the input from simple to complex
	 * @param {*} array: alternative input in this round
	 * @returns 
	 */
	_strategicallySort(array){
		return array.sort((a, b) => {
			let undefinedCountA = this._countVal(a.input, "undefined");
			let undefinedCountB = this._countVal(b.input, "undefined");
		
			if (undefinedCountA !== undefinedCountB) {
				// Higher count of "undefined" values comes first
				return undefinedCountB - undefinedCountA;
			} else {
				// If counts of "undefined" values are equal, sort by count of "string" values
				let stringCountA = this._countVal(a.input, "string");
				let stringCountB = this._countVal(b.input, "string");
				return stringCountB - stringCountA;
			}
		});
	}


	_expandAlternatives(file, alternatives, testCoverage) {
		alternatives = this._strategicallySort(alternatives);

		alternatives.forEach(alt => {
			this._strategy.add({
				id: this._nextID(),
				path: file.path,
				input: alt.input,
				pc: alt.pc,
				undefinedUT: this.undefinedUT,
				forinLoad: alt.forinLoad,
				forinKeys: alt.forinKeys,
				forinKeyBound: alt.forinKeyBound
			}, alt, testCoverage);
		});
	}

	_pushDone(test, input, pc, pcString, alternatives, result, undefinedUT, undefinedPool, helperPool, forinLoad, coverage, errors) {
		this._done.push({
			id: test.file.id,
			input: input,
			undefinedUT: undefinedUT,
			pc: pc,
			pcString: pcString,
			result: result,
			errors: errors,
			undefinedPool: this.undefinedPool.getUndatedPool(undefinedPool),
			helperPool: this.helperPool.getUndatedPool(helperPool),
			forinLoad: forinLoad,
			time: test.time(),
			startTime: test.startTime(),
			coverage: this._coverage.current(),
			case_coverage: this.options.perCaseCoverage ?  new Coverage().add(coverage).final(true) : undefined, 
			replay: test.makeReplayString(),
			alternatives: alternatives
		});

		if (errors.length) {
			this._errors += 1;
		}
	}

	_testFileDone(spawn, code, test, finalOut, coverage, fsErrors) {

		let errors = fsErrors;

		if (code != 0) {
			errors.push({error: "Exit code non-zero"});
		}

		if (coverage) {
			this._coverage.add(coverage);
		}

		if (finalOut) {
			this._pushDone(test, finalOut.input, finalOut.pc, finalOut.pcString, finalOut.alternatives, finalOut.result, finalOut.undefinedUT, finalOut.undefinedPool, finalOut.helperPool, finalOut.forinLoad, coverage, errors.concat(finalOut.errors));
			this._expandAlternatives(test.file, finalOut.alternatives, coverage);
			this._stats.merge(finalOut.stats);
			this.undefinedPool.updatePool(finalOut.input, finalOut.undefinedPool);
			this.helperPool.updatePool(finalOut.input, finalOut.helperPool);
			
			if (finalOut.result) {
				this.success += 1;
			}

		} else {
			this._pushDone(test, test.file.input, test.file.pc, test.file.pcString, [], false, this.undefinedUT, [], [], false, coverage, errors.concat([{ error: "Error extracting final output - a fatal error must have occured" }]));
		}

		this._postTest(test);
	}

	/**
     * Where the spawn is created
     * 
     * @param {*} file 
     */
	_testFile(file) {
		this.undefinedPool.flushCurrentUpdatedMap();
		let nextTest = new Spawn(this.options.analyseScript, file, {
			undefinedPool: this.undefinedPool.getUndefinedPool(),
			log: this.options.printPaths,
			timeout: this.options.testMaxTime,
		});

		this._running.push(nextTest.start(this._testFileDone.bind(this)));
		this._printStatus();
	}

	_printStatus() {
		Log("[" + this._done.length + " done /" + this._strategy.length() +" queued / " + this._running.length + " running / " + this._errors + " errors / " + this._coverage.current().loc.toFixed(2) * 100 + "% coverage ] ***\n");
	}

	_printCurrentUndefinedUT(){
		Log(`Current Undefined Property Under Testing: ${this.undefinedUT}\n`);
	}

	_printUndefined() {
		Log(`Current Undefined Pool has ${this.undefinedPool.getLength()} properties: ${JSON.stringify(this.undefinedPool.getUndefinedPool())}\n`);
	}

	_printNewUndefined() {
		if(this.undefinedPool.getCurrentUpdatedMap().length > 0){
			Log(`Newly Discovered Undefined Props: ${JSON.stringify(this.undefinedPool.getCurrentUpdatedMap())}\n`);
		}
	}

	/**
     * called when the exiting the current scheduler
     * 
     * 1/ write the info to the log file
     * 2/ print out the stats/coverage/error/newly discovered undefined props/replay
     */
	_summary() {
		Log(`======================================== ENDING TEST RUN: ${this.undefinedUT} ========================================\n`);
        
		let logFilePath = this._setupLogFile();
		let newUndefinedMap = this.undefinedPool.getUpdatedMap();
		JsonWriter(logFilePath, this.file, this._coverage, this.starttime, (new Date()).getTime(), newUndefinedMap, this._done);

		function round(num, precision) {
			return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
		}

		function formatSeconds(v) {
			return round((v / 1000), 4);
		}

		this._done.forEach(item => {
			const pcPart = Config.printPathCondition ? (` PC: ${item.pc}`) : "";
			console.log(`[+] ${JSON.stringify(item.input)}${pcPart} took ${formatSeconds(item.time)}s`);
			item.errors.forEach(error => console.log(`[!] ${error.error}`));
			if (item.errors.length != 0) {
				console.log(`[!] ${item.replay}`);
			}
		});
		
		console.log("[!] Newly Found Undefined Properties: ");
		for (var key in newUndefinedMap) {
			console.log("[+] ".concat(key, ": ").concat(newUndefinedMap[key].toString()));
		}

		console.log("[!] Stats");
		for (const stat in this.stats) {
			console.log(`[+] ${stat}: ${JSON.stringify(this.stats[stat].payload)}`);
		}

		console.log("[!] Done");
		let totalLines = 0;
		let totalRealLines = 0;
		let totalLinesFound = 0;

		this._coverage.final().forEach(d => {
			if (isInternal(d.file)) {
				return;
			}

			console.log(`[+] ${d.file}. Coverage (Term): ${Math.round(d.terms.coverage * 100)}% Coverage (Decisions): ${Math.round(d.decisions.coverage * 100)}% Coverage (LOC): ${Math.round(d.loc.coverage * 100)}% Lines Of Code: ${d.loc.total} -*`);
			totalLines += d.loc.total;
			totalRealLines += d.loc.all.length;
			totalLinesFound += d.loc.found;
		});

		Math.round((totalLinesFound / totalRealLines) * 10000) / 100;
		console.log(`[+] Total Lines Of Code ${totalLines}`);
		console.log(`[+] Total Coverage: ${totalLinesFound / totalRealLines}%`);

		if (Config.printDeltaCoverage) {
			CoverageMap(this._coverage.lines(), line => console.log(line));
		} else {
			console.log("[+] EXPOSE_PRINT_COVERAGE=1 for line by line breakdown");
		}

		console.log(`[+] ExpoSE Finished Testing: ${this.undefinedUT.length>0?this.undefinedUT:"unknown"}, ${this._done.length} paths, ${this._errors} errors`);
		Log("======================================== ENDING TEST RUN ========================================\n");
	}

	_setupLogFile(){
		let dateObj = new Date();
		// let fname = path.basename(this.file).replace(".js","");

		let logUndefPropName = [];
		if(this.undefinedUT.length>0){
			for (let i = 0; i < this.undefinedUT.length; i++) {
				if (/\n|\s|[/]/.test(this.undefinedUT[i])) {
					logUndefPropName[i] = `longString${dateObj.getSeconds()}`;
				}else {
					logUndefPropName[i] = this.undefinedUT[i];
				}
			}
		}

		let logfname = `${this.undefinedUT.length>0 ? logUndefPropName.join("-"):"unknown"}-${dateObj.getMonth()+1}-${dateObj.getDate()}-${dateObj.getHours()}-${dateObj.getMinutes()}-log.json`;

		let logFilePath = path.dirname(this.file) + "/log/" + logfname;
		if (Config.jsonOut) {
			logFilePath = Config.jsonOut + "/log/" + logfname;
		}

		// Ensure the log directory exists
		fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

		console.log(`[+] Writing output to ${logFilePath}`);

		return logFilePath;
	}

}

export default Scheduler;