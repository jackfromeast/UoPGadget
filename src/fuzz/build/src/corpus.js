
const fs = require("fs");
const path = require('path');
// import * as path from "path";
// import {uint16, uint32} from "./math";
//const fork = require('child_process').fork;
//var crypto = require('crypto');


const INTERESTING32 = ["255", "32767", "-128", "-1", "0", "1", "127"];

"use strict"
class Corpus {
    // private corpusPath: string | undefined;
    // private stringStore: Object;
    // private inputs: Object;
    // private outputs: Buffer[];
    // private child;

    constructor() {
        let buf = "";
        const filePath = path.join(__dirname, 'corpus', 'strings.json');

        const filePath2 = path.join(__dirname, 'corpus', 'properties.json');

        buf = fs.readFileSync(filePath, 'utf8')
  
        this.stringStore = JSON.parse(buf);

        buf = fs.readFileSync(filePath2, 'utf8')

        this.inputs = JSON.parse(buf); 
  
        this.outputs = [];
        this.generateOutput();
        this.cur = 0;
    }

    //generate objects in child process
    generateOutput() {
        for (let i = 0; i < 100; i++ ){
            if (i < 33) { 
                let key = this.inputs[Math.floor(Math.random()*this.inputs.length)];
                let val = this.stringStore.strings[Math.floor(Math.random() * this.stringStore.strings.length)];
                let n = {};
                n[key] = val;
                //console.log(this.pushObj(key, val));
                this.outputs.push(n);
            }else if (i < 66) {
                let key1 = this.inputs[i%3];
                let key2 = this.inputs[(i+1)%3];
                let val1 = INTERESTING32[Math.floor(Math.random() * INTERESTING32.length)];
                let val2 = this.stringStore.strings[Math.floor(Math.random() * this.stringStore.strings.length)];
                let n = {};
                n[key1] = val1;
                n[key2] = val2;
                this.outputs.push(n);
            }else {
                let key1 = this.inputs[i%3];
                let key2 = this.inputs[(i+1)%3];
                let key3 = this.inputs[(i+2)%3];
                let val1 = this.stringStore.strings[Math.floor(Math.random() * this.stringStore.strings.length)];
                let val2 = INTERESTING32[Math.floor(Math.random() * INTERESTING32.length)];
                let val3 = this.stringStore.strings[Math.floor(Math.random() * this.stringStore.strings.length)];
                let n = {};
                n[key1] = val1;
                n[key2] = val2;
                n[key3] = val3;
                this.outputs.push(n);
            }
        }
        
        // let buf =  Buffer.from(JSON.stringify(a));
        // return buf;
    }

    getLength() {
        return this.outputs.length - this.cur ;
    }

    generateInput() {
        
        let a = this.outputs[this.cur++];
        return Buffer.from(JSON.stringify(a));   
        // let a = {"asString": "1","name":"2","inject": "flag{fuzzing_is_fun!}"};
        // console.log(a);
        // return Buffer.from(JSON.stringify(a));     
        
    }

    pushObj(key, val) {
        let a = {};
        a[key]=val;
        return a;
    }    
    // putBuffer(buf) {
    //     this.inputs.push(buf);
    //     if (this.corpusPath) {
    //         const filename = crypto.createHash('sha256').update(buf).digest('hex');
    //         const filepath = path.join(this.corpusPath, filename);
    //         fs.writeFileSync(filepath, buf)
    //     }
    // }

    
}
exports.corpus = Corpus;
// let c = new Corpus();

// for (i in Range(1000)) {
//     console.log(c.generateInput());
// }


//bool one obj case
// default:
                    //     for (let k = 0; k < Object.keys( this.stringStore ).length; k++) {
                    //         let val = this.stringStore.strings[k];
                    //         let a = this.arrPushObj(CKarr[i], Parr[j], val);
                    //         let buf =  Buffer.from(JSON.stringify(a));
                    //         this.outputs.push(buf);
                    //     }
                    //     for (let k = 0; k < INTERESTING32.length; k++) {
                    //         let val = INTERESTING32[k];
                    //         let a =this.arrPushObj(CKarr[i], Parr[j], val);
                    //         let buf =  Buffer.from(JSON.stringify(a));
                    //         this.outputs.push(buf);
                    //     }
                    //     this.arrPushObj(CKarr[i], Parr[j], true);
                    //     this.arrPushObj(CKarr[i], Parr[j], false);