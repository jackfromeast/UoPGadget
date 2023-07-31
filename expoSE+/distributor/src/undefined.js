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

	/**
	 * Only used for debugging for each input when running a test case
	 * @returns 
	 */
	getCurrentUpdatedMap() {
		return this.currentUpdataedMap;
	}

	// getNewUndefinedUT(){
	// 	let newUndefined = [];
	// 	for (let key in this.currentUpdataedMap) {
	// 		for (let prop in this.currentUpdataedMap[key]) {
	// 			newUndefined.push(prop);
	// 		}
	// 	}
	// 	return newUndefined;
	// }

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
 *
 * each items in the queue consists of:
 * {
 * 	props: [],
 * 	initialInput: undefined,
 * 	withHelper: undefined,
 * 	withChain: undefined,
 * 	roundid: 0 // when does the items has been added to the queue
 * }
 * 
 */
class UndefinedUTQ {
	constructor(testFile=undefined, order="backward") {
		this.seenUndefPool = [];
		this.queue = [];
		this.currentProp = undefined;
		this.roundid = 0;
		this.secondLoad = false;

		this.order = order;

		if (testFile) {
			try {
				const data = fs.readFileSync(testFile, { encoding: "utf8" });

				this.addInitialProps(JSON.parse(data));

			} catch (err) {
				console.log(err);
			}
		}else{
			this.insert({
				props: [],
				initialInput: undefined,
				withHelper: undefined,
				withChain: undefined,
				roundid: this.roundid
			});
			this.roundid++;
		}

		/** Patching properties */
		this.helperProps = [];		/** all the tested helper properties */
		this.successHelper = [];

		/** Chained properties */
		this.chainedPropsMap = {};		/** all the tested chained properties */

		/** Logging */
		this.newAddedHelper = [];
		this.newAddedChain = [];
	}

	addInitialProps(props) {
		for (let i = 0; i < props.length; i++) {
			if (arraysEqual(props[i], ["_expose"])) {continue;}
			this.push({
				props: props[i],
				initialInput: undefined,
				withHelper: undefined,
				withChain: undefined,
				roundid: this.roundid
			});
			this.seenUndefPool = this.seenUndefPool.concat(props[i]);
		}

		if(this.order==="backward"){
			this.queue = this.queue.reverse();
		}else if(this.order==="random"){
			this.queue = this.queue.sort(() => Math.random() - 0.5);
		}else{
			this.queue = this.queue;
		}

		this.roundid++;
	}

	/**
	 * Add found helper properties to the queue
	 * 
	 * when testing prop1, we found [prop3, prop4, prop5] as helper properties
	 * then, we add [[prop1, prop3], [prop1, prop4], [prop1, prop5]] to the queue
	 * 
	 * Our current strategy:
	 * successHelper: helper property that will no longer cause the error
	 * we test successHelper every time and for other helper properties candidate, we only test them once
	 * 
	 * @param {*} props 
	 */
	addHelperProps(propsUT, props) {
		// let newProps = props.filter(ele => !this.helperProps.includes(ele));
		let newProps = props.reverse();
		
		if (this.successHelper.length > 0) {
			for (let i = 0; i < this.successHelper.length; i++) {
				if (!propsUT.includes(this.successHelper[i])) {
					this.insert({
						props: [...propsUT, this.successHelper[i]],
						initialInput: undefined,
						withHelper: this.successHelper[i],
						withChain: undefined,
						roundid: this.roundid
					});
					this.newAddedHelper.push([...propsUT, this.successHelper[i]]);
				}
			}
		}

		for (let i = 0; i < newProps.length; i++) {
			if (!propsUT.includes(newProps[i]) && !this.helperProps.includes(newProps[i])){
				this.insert({
					props: [...propsUT, newProps[i]],
					initialInput: undefined,
					withHelper: newProps[i],
					withChain: undefined,
					roundid: this.roundid
				});
				this.helperProps.push(newProps[i]);
				this.newAddedHelper.push([...propsUT, newProps[i]]);
			}
		}
		this.roundid++;
	}

	addSuccessHelper(props){
		if(!this.successHelper.includes(props)){
			this.successHelper = [...this.successHelper, props];
		}
	}

	/**
	 * Add found chained properties to the queue (push)
	 * @param {*} propsUT 
	 * @param {*} undefUpdateMap: "input": [prop1, prop2, prop3]
	 */
	addChainProps(propsUT, undefUpdateMap) {
		for (let input in undefUpdateMap) {
			for (let prop of undefUpdateMap[input]) {
				// if (!this.seenUndefPool.includes(prop) && !propsUT.includes(prop)){
				if (!propsUT.includes(prop)){
					this.push({
						props: [...propsUT, prop],
						initialInput: JSON.parse(input),
						withHelper: undefined,
						withChain: prop,
						roundid: this.roundid
					});
					this.chainedPropsMap[input] = prop;
					this.seenUndefPool.push(prop);
					this.newAddedChain.push(prop);
				}
				// }
			}
		}
		this.roundid++;
	}

	cleanUp(roundid) {
		this.queue = this.queue.filter(item => (item.roundid !== roundid || !item.withHelper));
	}

	cleanNewAddedProps(){
		this.newAddedHelper = [];
		this.newAddedChain = [];
	}

	addSecondChainLayer(){
		if(this.secondLoad){return;}
		let secLayerChain = [];
		for (let i = 0; i < this.seenUndefPool.length; i++) {
			for (var j = i + 1; j < this.seenUndefPool.length; j++) {
				secLayerChain.push([this.seenUndefPool[i], this.seenUndefPool[j]]);
			}
		}

		for (let i = 0; i < secLayerChain.length; i++) {
			this.push({
				props: secLayerChain[i],
				initialInput: undefined,
				withHelper: undefined,
				withChain: undefined,
				roundid: this.roundid
			});
		}
		this.roundid++;
		this.secondLoad = true;
	}

	getCurrentUT(){
		return this.currentProp;
	}

	next(){
		this.currentProp = this.queue.shift();
		return this.currentProp;
	}

	push(input){
		this.queue.push(input);
	}

	insert(input){
		this.queue.unshift(input);
	}

	pushArray(input){
		this.queue = this.queue.concat(input);
	}

	getLength(){
		return this.queue.length;
	}
}

function arraysEqual(a, b) {
	if (a.length !== b.length) return false;
	for (var i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

export default {UndefinedPool, UndefinedUTQ};