"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const cp = require('child_process');
const corpus = require("./corpus");
const fs = require("fs");
const child_process_1 = require("child_process");
const protocol_1 = require("./protocol");
const versifier_1 = require("./versifier");
const crypto = require('crypto');
const util = require('util');
const pidusage = require('pidusage');
process.on('SIGINT', function () {
    // ignore sigint as this propagates to worker as well.
    console.log('Received SIGINT. shutting down gracefully');
});
class Fuzzer {
    constructor(target, dir, exactArtifactPath, rssLimitMb, timeout, regression, onlyAscii, versifier) {
        this.target = target;
        this.corpus = new corpus.corpus();
        this.onlyAscii = onlyAscii;
        this.versifier = versifier;
        this.verse = null;
        this.total_executions = 0;
        this.total_coverage = 0;
        this.exactArtifactPath = exactArtifactPath;
        this.rssLimitMb = rssLimitMb;
        this.timeout = timeout;
        this.regression = regression;
        this.worker = child_process_1.fork(`${__dirname}/worker.js`, [this.target], { execArgv: [`--max-old-space-size=${this.rssLimitMb}`] });
        this.workerRss = 0;
        this.rssInterval = null;
        this.pulseInterval = null;
        this.lastSampleTime = Date.now();
        this.executionsInSample = 0;
    }
    logStats(type) {
        const rss = Math.trunc((process.memoryUsage().rss + this.workerRss) / 1024 / 1024 * 100) / 100;
        const endTime = Date.now();
        const execs_per_second = Math.trunc(this.executionsInSample / (endTime - this.lastSampleTime) * 1000);
        this.lastSampleTime = Date.now();
        this.executionsInSample = 0;
        console.log(`#${this.total_executions} ${type}     cov: ${this.total_coverage} corp: ${this.corpus.getLength()} exec/s: ${execs_per_second} rss: ${rss} MB`);
    }
    writeCrash(buf) {
        let filepath = 'crash-' + crypto.createHash('sha256').update(buf).digest('hex');
        if (this.exactArtifactPath) {
            filepath = this.exactArtifactPath;
        }
        fs.writeFileSync(filepath, buf);
        console.log(`crash was written to ${filepath}`);
        if (buf.length < 200) {
            console.log(`crash(hex)=${buf.toString('hex')}`);
        }
    }
    clearIntervals() {
        if (this.rssInterval) {
            clearInterval(this.rssInterval);
            this.rssInterval = null;
        }
        if (this.pulseInterval) {
            clearInterval(this.pulseInterval);
            this.pulseInterval = null;
        }
        pidusage.clear();
    }
    start() {
        console.log(`#0 READ units: ${this.corpus.getLength()}`);
        this.startTime = Date.now();
        this.lastSampleTime = Date.now();
        let executions = 0;
        let buf = this.corpus.generateInput();
        console.log(buf);
        let startTimeOneSample = Date.now();
        this.worker.on('message', (m) => {
            this.total_executions++;
            this.executionsInSample++;
            const endTimeOneSample = Date.now();
            const diffOneSample = endTimeOneSample - startTimeOneSample;
            startTimeOneSample = endTimeOneSample;
            if (m.type === protocol_1.WorkerMessageType.CRASH) {
                this.writeCrash(buf);
                this.clearIntervals();
                return;
            }
            else if (m.coverage > this.total_coverage) {
                this.total_coverage = m.coverage;
                //this.corpus.putBuffer(buf);
                this.logStats('NEW');
                if (buf.length > 0 && this.versifier) {
                    this.verse = versifier_1.BuildVerse(this.verse, buf);
                }
            }
            else if ((diffOneSample / 1000) > this.timeout) {
                console.log("=================================================================");
                console.log(`timeout reached. testcase took: ${diffOneSample}`);
                this.worker.kill('SIGKILL');
                return;
            }
            if (this.total_executions % 10 != 0 || this.verse === null || !this.versifier) {
                buf = this.corpus.generateInput();
            }
            else {
                buf = this.verse.Rhyme();
            }
            this.worker.send({
                type: protocol_1.ManageMessageType.WORK,
                buf: buf
            });
        });
        this.worker.on('error', (e) => {
            console.log('error received');
            console.log(e);
        });
        this.worker.on('exit', (code, signal) => {
            if (signal && code !== 0) {
                console.log('Worker killed');
                this.writeCrash(buf);
            }
            console.log('Worker exited');
            this.clearIntervals();
        });
        this.worker.send({
            type: protocol_1.ManageMessageType.WORK,
            buf: buf
        });
        this.pulseInterval = setInterval(() => {
            this.logStats("PULSE");
        }, 3000);
        this.rssInterval = setInterval(async () => {
            const stats = await pidusage(this.worker.pid);
            this.workerRss = stats.memory;
            if (this.workerRss > this.rssLimitMb * 1024 * 1024) {
                this.clearIntervals();
                console.log(`MEMORY OOM: exceeded ${this.rssLimitMb} MB. Killing worker`);
                this.worker.kill('SIGKILL');
            }
            const diffOneSample = Date.now() - startTimeOneSample;
            if ((diffOneSample / 1000) > this.timeout) {
                console.log("=================================================================");
                console.log(`timeout reached. testcase took: ${diffOneSample}`);
                this.worker.kill('SIGKILL');
                return;
            }
        }, 3000);
    }
}
exports.Fuzzer = Fuzzer;
//
// process.once('SIGTERM', function (code) {
//     console.log('SIGTERM received...');
// });
//# sourceMappingURL=fuzzer.js.map