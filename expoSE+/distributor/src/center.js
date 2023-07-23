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
			this.undefinedUTQ = new Undef.UndefinedUTQ(this.options.undefinedUTQ);
			this.multiUT = true;
		}else{
			this.undefinedUTQ = new Undef.UndefinedUTQ(this.options.undefinedUTQ);
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
		this.setupLogFile(file);
		this.curUndefined = this.undefinedUTQ.next();
		while(this.curUndefined){
			this.scheduler = new Scheduler(this.curUndefined);

			const done = new Promise(resolve => {
				this.scheduler.on("done", (propsUT, newlyFoundProps, newHelperProps, success) => {
					this.curTestEndTime = Date.now();

					if (success && this.curUndefined.withHelper) {
						this.undefinedUTQ.addSuccessHelper(this.curUndefined.withHelper);
						
						// clean up the items in the queue that used to test the helper property
						this.undefinedUTQ.cleanUp(this.curUndefined.roundid);
					}

					if (!success && !this.curUndefined.withHelper && this.helperProp){
						this.undefinedUTQ.addHelperProps(propsUT, newHelperProps);
					}

					if (!success && this.chainProp) {
						this.undefinedUTQ.addChainProps(propsUT, newlyFoundProps);
					}
					
					this.scheduler = null;  // explicitly set null for garbage collection

					/** logging */
					this.log({
						"id": this.id++,
						"props": propsUT,
						"withHelper": this.curUndefined.withHelper,
						"withChain": this.curUndefined.withChain,
						"time": (this.curTestEndTime - this.curTestStartTime) / 1000,
						"success": success,
						"newlyFoundProps": newlyFoundProps,
						"addQueueHelper": this.undefinedUTQ.newAddedHelper,
						"addQueueChain": this.undefinedUTQ.newAddedChain,
						"roundid": this.curUndefined.roundid,
					}); //
					this.undefinedUTQ.cleanNewAddedProps();
					this.clearTime();

					resolve();  // Resolve the promise, allowing the loop to continue
				});
			});

			this.curTestStartTime = Date.now();
			this.scheduler.start(file, baseInput);		/** this is asynchronouns call */

			await done;									/** suspend at here */
			
			this.curUndefined = this.undefinedUTQ.next();
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

	
}

export default Center;
