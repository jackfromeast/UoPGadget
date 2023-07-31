/**
 * This file has been adapted from the original found at expoSE+/distributor/src/center.js.
 *
 * Enhancements have been made to support the testing of multiple undefined properties. 
 * This allows us to 
 * 1/ preemptively define symbolic variables in the frontend and test them sequentially.
 * 2/ apply the strategy in the center class to determine the next undefined property
 * (or group thereof) to be tested.
 *
 * The original functionality, primarily concerned with scheduling tests for a group of undefined
 * properties under testing, has been transferred to the scheduler module.
 *
 * Modified by: jackfromeast
 */ 

import Undef from "./undefined";
import Config from "./config";
import Coverage from "./coverage-aggregator";
import Scheduler from "./scheduler";
import fs from "fs";
import path from "path";

class Center {

	constructor() {
		this.cbs = [];
		this.multiUT = false;
		this._cancelled = false;
		this.options = Config;
		
		this.chainProp = this.options.chainProp;
		this.helperProp = this.options.helperProp;

		if (this.options.undefinedUTQ){
			this.undefinedUTQ = new Undef.UndefinedUTQ(this.options.undefinedUTQ, this.options.testOrder);
			this.multiUT = true;
		}else{
			this.undefinedUTQ = new Undef.UndefinedUTQ(this.options.undefinedUTQ, this.options.testOrder);
			this.multiUT = false;
		}

		this.scheduler = null;
		this.curUndefined = null;

		this.logFilePath = null;
		this.logObj = {};
		this.logItems = [];
		this.curTestStartTime = null;
		this.curTestEndTime = null;
		this.id = 0;

		/**
		 * This part is used for experiment RQ3
		 * how long does it take to find the correct undefine property
		 */
		this.startTime = Date.now();

		this.coverage = new Coverage(); /** per PuT */

	}

	start(file, baseInput) {
		if (this.multiUT){
			return this.startMulti(file, baseInput);
		}else{
			return this.startSingle(file, baseInput);
		}
	}

	cancel(){
		if (this.scheduler !== null){
			this.scheduler.cancel();
		}
	}

	/**
	 * We made this function synchronous
	 * 
	 * @param {*} file 
	 * @param {*} baseInput 
	 */
	async startMulti(file, baseInput){
		// let tpflag = false;
		// let tpTime = -1;
		let tpCount = 0;

		this.setupLogFile(file);
		this.curUndefined = this.undefinedUTQ.next();

		// if(this.curUndefined && this.tps.some(subArray => this._arrayEqual(this.curUndefined.props, subArray))){
		// 	tpflag = true;
		// 	tpTime = Date.now()-this.startTime;
		// }

		while(this.curUndefined){
			this.scheduler = new Scheduler(this.curUndefined, this.coverage);

			const done = new Promise(resolve => {
				this.scheduler.on("done", (propsUT, newlyFoundProps, newHelperProps, success, successHelper, coverage) => {
					this.curTestEndTime = Date.now();

					if (successHelper) {
						for(let i=0, len=successHelper.length; i<len; i++){
							this.undefinedUTQ.addSuccessHelper(successHelper[i]);
						}

						// clean up the items in the queue that used to test the helper property
						if(success){
							this.undefinedUTQ.cleanUp(this.curUndefined.roundid);
						}
					}

					if (!success && !this.curUndefined.withHelper && this.helperProp){
						this.undefinedUTQ.addHelperProps(propsUT, newHelperProps);
					}

					if (!success && this.chainProp) {
						this.undefinedUTQ.addChainProps(propsUT, newlyFoundProps);
					}
					
					this.scheduler = null;  // explicitly set null for garbage collection

					let curTestTime = (this.curTestEndTime - this.curTestStartTime) / 1000;

					/** coverage per undefined property test group */
					this.coverage = coverage;
					// let totalLines = 0;
					let totalRealLines = 0;
					let totalLinesFound = 0;
					this.coverage.final().forEach(d => {
						// totalLines += d.loc.total;
						totalRealLines += d.loc.all.length;
						totalLinesFound += d.loc.found;
					});
					let lineCoverage = (totalLinesFound / totalRealLines)*100;
					this.uniquePathNum = this.coverage.getUniquePathNum();

					/** logging */
					this.log({
						"id": this.id++,
						"props": propsUT,
						"withHelper": this.curUndefined.withHelper,
						"withChain": this.curUndefined.withChain,
						"time": curTestTime,
						"tpTime": success ? ((this.curTestEndTime-this.startTime) / 1000) - curTestTime : -1,
						"tpCount": tpCount++,
						"success": success,
						"newlyFoundProps": newlyFoundProps,
						"addQueueHelper": this.undefinedUTQ.newAddedHelper,
						"addQueueChain": this.undefinedUTQ.newAddedChain,
						"addSuccessHelper": successHelper,
						"roundid": this.curUndefined.roundid,
						"linecoverage": lineCoverage,
						"uniquePathNum": this.uniquePathNum,
						"pastTime": (this.curTestEndTime-this.startTime) / 1000,
					}); //
					this.undefinedUTQ.cleanNewAddedProps();
					this.clearTime();

					resolve();  // Resolve the promise, allowing the loop to continue
				});
			});

			// if(this.curUndefined.props && this.tps.some(subArray => this._arrayEqual(this.curUndefined.props, subArray))){
			// 	tpflag = true;
			// 	tpTime = Date.now()-this.startTime;
			// }

			this.curTestStartTime = Date.now();
			this.scheduler.start(file, baseInput);		/** this is asynchronouns call */

			await done;									/** suspend at here */
			
			this.curUndefined = this.undefinedUTQ.next();

			if(!this.curUndefined && (this.options.chainLayer==="2")){
				this.undefinedUTQ.addSecondChainLayer();
				this.curUndefined = this.undefinedUTQ.next();
			}
		}
	}

	async startSingle(file, baseInput) {
		this.scheduler = new Scheduler({
			props: [],
			initialInput: baseInput,
			withHelper: false,
			withChain: false,
			roundid: 0,
		});

		const done = new Promise(resolve => {
			this.scheduler.on("done", () => {
				this.scheduler = null;  // explicitly set null for garbage collection
				resolve();  // Resolve the promise, allowing the loop to continue
			});
		});

		this.scheduler.start(file, baseInput);		/** this is asynchronouns call */

		await done;									/** suspend at here */
	}

	
	addCb(cb) {
		this.cbs.push(cb);
		return this;
	}

	log(item){
		this.logItems.push(item);

		this.logObj["tests"] = this.logItems;
		fs.writeFileSync(this.logFilePath, JSON.stringify(this.logObj, null, 2));
	}

	setupLogFile(file){
		let dateObj = new Date();

		let logfname = `center-${dateObj.getMonth()+1}-${dateObj.getDate()}-${dateObj.getHours()}-${dateObj.getMinutes()}-log.json`;

		this.logFilePath = path.dirname(file) + "/log/summary/" + logfname;
		if (Config.jsonOut) {
			this.logFilePath = Config.jsonOut + "/log/summary/" + logfname;
		}

		// Ensure the log directory exists
		fs.mkdirSync(path.dirname(this.logFilePath), { recursive: true });

		this.setupLogObj(file);
	}

	setupLogObj(file){
		this.logObj["testfile"] = file;
		this.logObj["initialUndefinedPool"] = this.undefinedUTQ.seenUndefPool;
	}

	clearTime(){
		this.curTestStartTime = null;
		this.curTestEndTime = null;
	}

	_arrayEqual(a, b){
		if (a.length !== b.length) {
			return false;
		}

		// sort both arrays
		a.sort();
		b.sort();

		for (var i = 0; i < a.length; i++) {
			if (a[i] !== b[i]) {
				return false;
			}
		}
		
		return true;
	}
	
}

export default Center;
