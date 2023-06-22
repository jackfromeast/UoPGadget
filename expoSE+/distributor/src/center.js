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
		this.curUndefined = this.undefinedUTQ.next();
		while(this.curUndefined){
			this.scheduler = new Scheduler(this.curUndefined);

			const done = new Promise(resolve => {
				this.scheduler.on("done", (propsUT, newlyFoundProps, newHelperProps, success) => {
					if (success && this.curUndefined.withHelper) {
						this.undefinedUTQ.addSuccessHelper(this.curUndefined.withHelper);
						
						// clean up the items in the queue that used to test the helper property
						this.undefinedUTQ.cleanUp(this.curUndefined.roundid);
					}

					if (!success && this.helperProp){
						this.undefinedUTQ.addHelperProps(propsUT, newHelperProps);
					}

					if (!success && this.chainProp) {
						this.undefinedUTQ.addChainProps(propsUT, newlyFoundProps);
					}
					
					this.scheduler = null;  // explicitly set null for garbage collection

					resolve();  // Resolve the promise, allowing the loop to continue
				});
			});

			this.scheduler.start(file, baseInput);		/** this is asynchronouns call */

			await done;									/** suspend at here */
			
			this.curUndefined = this.undefinedUTQ.next();
		}
	}

	async startSingle(file, baseInput) {
		this.scheduler = new Scheduler([]);

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

	
}

export default Center;
