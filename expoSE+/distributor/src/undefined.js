/**
 * undefinedPool is used to
 * 1/ store overall undefined props as a pool of the test file
 * 2/ store newly discovered undefined props of each test case
 */

const fs = require("fs");


class UndefinedPool {
	constructor(initalFile=undefined) {
		this.undefinedPool = [];
		this.updatedMap = {};
		// for each test case, store newly discovered undefined props
		this.currentUpdataedMap = {};

		if (initalFile) {
			try {
				const data = fs.readFileSync(initalFile, { encoding: "utf8" });
				this.undefinedPool = Object.keys(JSON.parse(data));
			} catch (err) {
				console.log(err);
			}
		}
	}

	updatePool(input, pool){
		// check if pool has newly discovered undefined props
		// if yes, update pool
		// if no, return pool
		let newUndefined = pool.filter((elem) => !this.undefinedPool.includes(elem));
		if (newUndefined.length > 0) {
			this.undefinedPool = this.undefinedPool.concat(newUndefined);
			this.updatedMap[JSON.stringify(input)] = newUndefined;
			this.currentUpdataedMap[JSON.stringify(input)] = newUndefined;
		}
	}

	flushCurrentUpdatedMap() {
		this.currentUpdataedMap = {};
	}

	getCurrentUpdatedMap() {
		return this.currentUpdataedMap;
	}

	/** FIXME: only support [[xxx], [yyy]] */
	getNewUndefinedUT(){
		let newUndefined = [];
		for (let key in this.currentUpdataedMap) {
			for (let prop in this.currentUpdataedMap[key]) {
				newUndefined.push([prop]);
			}
		}
		return newUndefined;
	}

	getUndatedPool(pool){
		let newUndefined = pool.filter((elem) => !this.undefinedPool.includes(elem));
		return newUndefined;
	}

	addUndefined(undef) {
		this.pool.push(undef);
	}

	getUpdatedMap() {
		return this.updatedMap;
	}

	getUndefinedPool() {
		return this.undefinedPool;
	}

	getLength() {
		return this.undefinedPool.length;
	}

}

/**
 * undefinedUTQ is used to maintain the queue of undefined props under testing
 * 
 * FIXME: 
 * Sometimes, we set the initial input value of a chained property that is necessary to find the paired undefined prop. In addtion, we might need to make that property's value fixed.
 * Currently, we only support something like: [[prop1], [prop2], [prop1, prop3], ...]
 * 
 */
class UndefinedUTQ {
	constructor(testFile=undefined) {
		this.queue = [];
		this.currentProp = undefined;

		if (testFile) {
			try {
				const data = fs.readFileSync(testFile, { encoding: "utf8" });
				
				// remove the _expose internal property
				data = data.filter(item => item !== ['_expose']);

				this.queue = JSON.parse(data);
			} catch (err) {
				console.log(err);
			}
		}
	}

	getCurrentUT(){
		return this.currentProp;
	}

	next(){
		this.currentProp = this.queue.pop();
		return this.currentProp;
	}

	push(input){
		this.queue.push(input);
	}

	pushArray(input){
		this.queue = this.queue.concat(input);
	}

	getLength(){
		return this.queue.length;
	}
}

export default {UndefinedPool, UndefinedUTQ};