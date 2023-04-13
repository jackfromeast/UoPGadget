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

		if (initalFile) {
			try {
				const data = fs.readFileSync(initalFile, { encoding: "utf8" });
				this.undefinedPool = JSON.parse(data);
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
		}
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

export default UndefinedPool;