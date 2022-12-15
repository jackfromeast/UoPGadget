/// <reference types="node" />
export declare class Fuzzer {
    private corpus;
    private total_executions;
    private total_coverage;
    private exactArtifactPath;
    private rssLimitMb;
    private timeout;
    private target;
    private startTime;
    private worker;
    private workerRss;
    private rssInterval;
    private pulseInterval;
    private lastSampleTime;
    private executionsInSample;
    private regression;
    private verse;
    private readonly versifier;
    private readonly onlyAscii;
    constructor(target: string, dir: string[], exactArtifactPath: string, rssLimitMb: number, timeout: number, regression: boolean, onlyAscii: boolean, versifier: boolean);
    logStats(type: string): void;
    writeCrash(buf: Buffer): void;
    clearIntervals(): void;
    start(): void;
}
