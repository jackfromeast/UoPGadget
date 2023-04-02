import Config from "./config";
import Default from "./strategies/default";
import Deterministic from "./strategies/deterministic";
import Random from "./strategies/random";
import BucketsDeterministic from "./strategies/buckets-deterministic";

export default (function() {
	const strat = Config.testStrategy; 
	switch (strat) {
	case "default": return Default;
	case "deterministic": return Deterministic;
	case "buckets_deterministic": return BucketsDeterministic;
	case "random": return Random;
	default: throw "Strategy Error";
	}
})();
