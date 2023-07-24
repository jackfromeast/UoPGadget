/* Copyright (c) Royal Holloway, University of London | Contact Blake Loring (blake@parsed.uk), Duncan Mitchell (Duncan.Mitchell.2015@rhul.ac.uk), or Johannes Kinder (johannes.kinder@rhul.ac.uk) for details or support | LICENSE.md for license details */

const fs = require("fs");

export default function(file, target, coverage, start, end, firstHitTime, newUndefinedMap, test_list) {
	// console.log(`\n*-- Writing JSON to ${file} --*`);
	fs.writeFile(file, JSON.stringify({
		source: target,
		undefinedUnderTesting: target.undefinedUT,
		// comment out since code coverage is not used
		// finalCoverage: coverage.final(true) /* Include SMAP in the final coverage JSON */ ,
		start: start,
		end: end,
		firstHit: firstHitTime,
		undefinedMap: newUndefinedMap,
		done: filterDone(test_list)
	}, null, 4), err => { if (err) console.log(`Failed to write JSON because ${err}`); });
}

/** jackfromeast
 * 
 * For each test case in the done structure, we only log the id, input, strinfiedPC, result, alternatives, time.
 * Currently, we do not log the coverage information, undefinedPool
 * 
 */

function filterDone(Done){
	let newDone = [];
	for(let i = 0; i < Done.length; i++){
		let test = Done[i];
		let newTest = {
			id: test.id,
			input: test.input,
			stringifiedPC: test.pcString,
			foundGagdet: test.result,
			alternatives: test.alternatives,
			helperPool: test.helperPool,
			// undefinedPool: test.undefinedPool,
			time: test.time
		};
		newDone.push(newTest);
	}
	return newDone;
}
