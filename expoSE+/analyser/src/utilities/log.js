/* Copyright (c) Royal Holloway, University of London | Contact Blake Loring (blake@parsed.uk), Duncan Mitchell (Duncan.Mitchell.2015@rhul.ac.uk), or Johannes Kinder (johannes.kinder@rhul.ac.uk) for details or support | LICENSE.md for license details */

import Config from "../config";
import { stringify } from "./safe-json";
const fs = require("fs");

function makeid(count) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < count; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

const path_dump_id = makeid(4);
const log_path = console.log; 

/**
 * Class to handle logging
 * Structured this way for historical reasons, unneeded 
 * logs are now removed at compile for performance
 */
 
// analyzer's log should use blue color
// sink's log should use red color
class Log {

    logHigh(msg) {
        log_path("\x1b[34m%s\x1b[0m", "[?] "+msg);
    }

    logMid(msg) {
        log_path("\x1b[34m%s\x1b[0m", "[?] "+msg);
    }

    log(msg) {
        log_path("\x1b[34m%s\x1b[0m", "[+] "+msg);
    }

    // lzy
    logPC(msg){
        log_path("\x1b[33m%s\x1b[0m", "[+] "+msg);
    }

    logUndefined(msg){
        log_path("\x1b[32m%s\x1b[0m", "[+] "+msg);
    }

    // lzy
    logSink(msg){
        log_path("\x1b[31m%s\x1b[0m", "[!] "+msg)
    }

    logQuery(clause, solver, checkCount, startTime, endTime, model, attempts, hitMax) {

        if (!Config.outQueriesDir) {
            return;
        }

        const dumpData = {
            clause: clause,
            model: model,
            attempts: attempts,
            startTime: startTime,
            endTime: endTime,
            hitMaxRefinements: hitMax,
            checkCount: checkCount,
            containedRe: (solver + clause).includes("str.in.re")
        };

        const dumpFileName = Config.outQueriesDir + "/" + path_dump_id;

        fs.appendFileSync(dumpFileName, stringify(dumpData) + "\nEXPOSE_QUERY_DUMP_SEPERATOR\n");

        this.log(`Wrote ${dumpFileName}`);
    }
}

export default new Log();
