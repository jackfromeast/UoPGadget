/* Copyright (c) Royal Holloway, University of London | Contact Blake Loring (blake@parsed.uk), Duncan Mitchell (Duncan.Mitchell.2015@rhul.ac.uk), or Johannes Kinder (johannes.kinder@rhul.ac.uk) for details or support | LICENSE.md for license details */



import {spawn} from "child_process";

const tmp = require("tmp");
const fs = require("fs");
const kill = require("tree-kill");

const EXPOSE_REPLAY_PATH = "expoSE replay";

class Spawn {

	constructor(script, file, opts) {
		this.script = script;
		this.file = file;
		this.options = opts;
		
		let inherit = {
			undefinedPool: opts.undefinedPool,
			withHelper: this.file.withHelper || false,
			withChain: this.file.withChain || false,
			forinLoad: this.file.forinLoad || false, 
			forinKeys: this.file.forinKeys || [],
			forinKeyBound: this.file.forinKeyBound || 0,
		};
		this.args = [this.file.path, JSON.stringify(this.file.input), JSON.stringify(this.file.undefinedUT), JSON.stringify(inherit)];
		// this.args = [this.file.path, JSON.stringify(this.file.input)];
		this.tmpCoverageFile = tmp.fileSync();
		this.tmpOutFile = tmp.fileSync();

		this.env = JSON.parse(JSON.stringify(process.env));
		this.env.EXPOSE_OUT_PATH = this.tmpOutFile.name;
		this.env.EXPOSE_COVERAGE_PATH = this.tmpCoverageFile.name;
	}

	_tryParse(data, type, errors) {
		try {
			return JSON.parse(data);
		} catch (e) {
			errors.push({error: "Exception E: " + e + " of " + type + " on " + data});
			return null;
		}
	}

	startTime() {
		return this._startTime;
	}

	endTime() {
		return this._endTime;
	}

	time() {
		return this._endTime - this._startTime;
	}

	_recordEndTime() {
		this._endTime = Date.now();
	}

	_processEnded(code, done) {

		this._recordEndTime();

		let me = this;
		let errors = [];
		let coverage = null;
		let finalOut = null;
		let count = 0;
		let test = this;

		function cb(err) {

			count++;

			if (err) {
				errors.push({error: err});
			}

			if (count == 2) {
				test.tmpOutFile.removeCallback();
				test.tmpCoverageFile.removeCallback();
				done(me, code, test, finalOut, coverage, errors);
			}
		}

		fs.readFile(this.tmpOutFile.name, {encoding: "utf8"}, function(err, data) {
			if (!err) {
				finalOut = test._tryParse(data, "test data", errors);
			}
			cb(err);
		});

		fs.readFile(this.tmpCoverageFile.name, {encoding: "utf8"}, function(err, data) {
			if (!err) {
				coverage = test._tryParse(data, "coverage data", errors);
			}
			cb(err);
		});
	}

	shellescape(a) {
		let ret = [];

		a.forEach(function(s) {

			if (/[^A-Za-z0-9_\/:=-]/.test(s)) {
				s = "'" + s.replace(/'/g, "'\\''") + "'";
			}

			ret.push(s);
		});

		return ret.join(" ");
	}

	_mkEnvReplay() {
		let envStr = "";
		for (let i in this.env) {
			envStr += i + "=\"" + this.env[i] + "\" ";
		}
		return envStr;
	}

	makeReplayString() {
		// replay igonre the undefined pool
		return /* this._mkEnvReplay() + */ EXPOSE_REPLAY_PATH + " " + this.shellescape(this.args.slice(0, 2));
	}

	kill() {
		kill(this._pid, "SIGKILL");  
	}

	_buildTimeout() {
		return setTimeout(() => {
			this.kill();
		}, this.options.timeout);
	}

	start(done) {

		this._startTime = Date.now();

		try {
			const stdio = this.options.log ? ["ignore", "inherit", "inherit"] : ["ignore", "ignore", "ignore"];
			const prc = spawn(this.script, this.args, {
				stdio: stdio,
				env: this.env,
				disconnected: false
			});

			prc.on("exit", code => {
				clearTimeout(this._killTimeout);
				this._processEnded(code, done);
			});

			this._killTimeout = this._buildTimeout();
			this._pid = prc.pid;
		} catch (ex) {
			console.log("Distributor ERROR: " + ex + " just falling back to default error");
			this._processEnded(99999, done);
		}

		return this;
	}
}

export default Spawn;
