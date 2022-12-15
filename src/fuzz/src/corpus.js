const fs = require("fs");
// import * as path from "path";
// import {uint16, uint32} from "./math";
//const fork = require('child_process').fork;
//var crypto = require('crypto');


const INTERESTING32 = new Uint32Array([255, 32767, -128, -1, 0, 1, 127]);

"use strict"
class Corpus {
    // private corpusPath: string | undefined;
    // private stringStore: Object;
    // private inputs: Object;
    // private outputs: Buffer[];
    // private child;

    constructor() {
        let buf = "";
        fs.readFile('..\corpus\strings.json', 'utf8', (err, data)=>{
      
            // Display the file content
            console.log(data);
            buf = data;
        });
        this.stringStore = JSON.parse(buf);

        fs.readFile('..\corpus\properties.json', 'utf8', function(err, data){
      
            // Display the file content
            console.log(data);
            buf = data;
        });
        this.inputs = JSON.parse(buf);          
        
        //this.child = fork(this.generateOutput, [], {stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ]});
        this.outputs = this.generateOutput();
        this.cur = 0;
    }

    //generate objects in child process
    generateOutput() {
        //one object
        for (let i = 0; i < Object.keys( this.inputs ).length; i++) {
            let CKarr = Object.keys(this.inputs);  //key array, CKarr[i] = current key
            let content = this.inputs[CKarr[i]];   //object with isA, properties as properties
            
            //one object
            this.oneObj(content, CKarr, i);

            //two objects
            this.twoObj(content, CKarr, i);
            
            //three objects
            this.threeObj(content, CKarr, i);
        }

        //two objects
        for (let i1 = 0; i < Object.keys( this.inputs ).length; i++) {
            for (let i2 = i1+1; i < Object.keys( this.inputs ).length; i++) {
                let CKarr = Object.keys(this.inputs);  //key array, CKarr[i] = current key (a, b, c)
                let content1 = this.inputs[CKarr[i1]];   //first object with isA, properties as properties
                let content2 = this.inputs[CKarr[i2]];   //second object with isA, properties as properties
                
                
                for (let j1 = 0; j1 < Object.keys(content1.properties).length; j1++) {
                    for (let j2 = 0; j2 < Object.keys(content2.properties).length; j2++) {
                        let Parr1 = Object.keys(content1.properties);  //the array of potential properties for obj 1
                        let Parr2 = Object.keys(content2.properties);  //the array of potential properties for obj 2
                        let type1 = content.properties[Parr1[j1]];      //the type of the property for obj 1
                        let type2 = content.properties[Parr2[j2]];      //the type of the property for obj 2
                        for (i in Range(this.lenGet(type1)*this.lenGet(type2))) {
                            //generate random values for each type
                            let val1 = randGet(type1);
                            let val2 = randGet(type1);
                            let val3 = randGet(type1);
                            let val4 = randGet(type2);
                            let val5 = randGet(type2);
                            let val6 = randGet(type2);

                            //generate objects with different number of properties
                            let a1 = this.arrPushObj(CKarr[i1], Parr1[j1], val1);
                            let b1 = this.arrPushObj(CKarr[i2], Parr2[j2], val4);

                            let a2 = this.arrPushObj2(CKarr[i1], Parr1[j1], val1, val2);
                            let b2 = this.arrPushObj2(CKarr[i2], Parr2[j2], val4, val5);

                            let a3 = this.arrPushObj3(CKarr[i1], Parr1[j1], val1, val2, val3);
                            let b3 = this.arrPushObj3(CKarr[i2], Parr2[j2], val4, val5, val6);

                            //1:1 object
                            buf =  Buffer.from(JSON.stringify([a1,b1]));
                            this.outputs.push(buf);

                            //1:2 objects
                            buf =  Buffer.from(JSON.stringify([a1,b2]));
                            this.outputs.push(buf);

                            //1:3 objects
                            buf =  Buffer.from(JSON.stringify([a1,b3]));
                            this.outputs.push(buf);

                            //2:2 objects
                            buf =  Buffer.from(JSON.stringify([a2,b2]));
                            this.outputs.push(buf);

                            //2:3 objects
                            buf =  Buffer.from(JSON.stringify([a2,b3]));
                            this.outputs.push(buf);

                            //3:3 objects
                            buf =  Buffer.from(JSON.stringify([a3,b3]));
                            this.outputs.push(buf);                       
                            
                        }                    
                    }
                }                 
            }
        }

        //three objects
        for (let i1 = 0; i < Object.keys( this.inputs ).length; i++) {
            for (let i2 = i1+1; i < Object.keys( this.inputs ).length; i++) {
                for (let i3 = i2+1; i < Object.keys( this.inputs ).length; i++) {
                    let CKarr = Object.keys(this.inputs);  //key array, CKarr[i] = current key (a, b, c)
                    let content1 = this.inputs[CKarr[i1]];   //first object with isA, properties as properties
                    let content2 = this.inputs[CKarr[i2]];   //second object with isA, properties as properties
                    let content3 = this.inputs[CKarr[i3]];   //third object with isA, properties as properties
                    
                    
                    for (let j1 = 0; j1 < Object.keys(content1.properties).length; j1++) {
                        for (let j2 = 0; j2 < Object.keys(content2.properties).length; j2++) {
                            for (let j3 = 0; j3 < Object.keys(content3.properties).length; j3++) {
                                let Parr1 = Object.keys(content1.properties);  //the array of potential properties for obj 1
                                let Parr2 = Object.keys(content2.properties);  //the array of potential properties for obj 2
                                let Parr3 = Object.keys(content3.properties);  //the array of potential properties for obj 3
                                let type1 = content.properties[Parr1[j1]];      //the type of the property for obj 1
                                let type2 = content.properties[Parr2[j2]];      //the type of the property for obj 2
                                let type3 = content.properties[Parr3[j3]];      //the type of the property for obj 3
                                for (i in Range(this.lenGet(type1)*this.lenGet(type2))*this.lenGet(type3)) {
                                    //generate random values for each type
                                    let val1 = randGet(type1);
                                    let val2 = randGet(type1);
                                    let val3 = randGet(type1);
                                    let val4 = randGet(type2);
                                    let val5 = randGet(type2);
                                    let val6 = randGet(type2);
                                    let val7 = randGet(type3);
                                    let val8 = randGet(type3);
                                    let val9 = randGet(type3);

                                    //generate objects with different number of properties
                                    let a1 = this.arrPushObj(CKarr[i1], Parr1[j1], val1);
                                    let b1 = this.arrPushObj(CKarr[i2], Parr2[j2], val4);
                                    let c1 = this.arrPushObj(CKarr[i3], Parr3[j3], val7);

                                    let a2 = this.arrPushObj2(CKarr[i1], Parr1[j1], val1, val2);
                                    let b2 = this.arrPushObj2(CKarr[i2], Parr2[j2], val4, val5);
                                    let c2 = this.arrPushObj2(CKarr[i3], Parr3[j3], val7, val8);

                                    let a3 = this.arrPushObj3(CKarr[i1], Parr1[j1], val1, val2, val3);
                                    let b3 = this.arrPushObj3(CKarr[i2], Parr2[j2], val4, val5, val6);
                                    let c3 = this.arrPushObj3(CKarr[i3], Parr3[j3], val7, val8, val9);

                                    //1:1:1 object
                                    buf =  Buffer.from(JSON.stringify([a1,b1,c1]));
                                    this.outputs.push(buf);

                                    //1:1:2 objects
                                    buf =  Buffer.from(JSON.stringify([a1,b1,c2]));
                                    this.outputs.push(buf);

                                    //1:1:3 objects
                                    buf =  Buffer.from(JSON.stringify([a1,b1,c3]));
                                    this.outputs.push(buf);

                                    //1:2:2 objects
                                    buf =  Buffer.from(JSON.stringify([a1,b2,c2]));
                                    this.outputs.push(buf);

                                    //1:2:3 objects
                                    buf =  Buffer.from(JSON.stringify([a1,b2,c3]));
                                    this.outputs.push(buf);

                                    //1:3:3 objects
                                    buf =  Buffer.from(JSON.stringify([a1,b3,c3]));
                                    this.outputs.push(buf);  
                                    
                                    //2:2:2 objects
                                    buf =  Buffer.from(JSON.stringify([a2,b2,c2]));
                                    this.outputs.push(buf);

                                    //2:2:3 objects
                                    buf =  Buffer.from(JSON.stringify([a2,b2,c3]));
                                    this.outputs.push(buf);

                                    //2:3:3 objects
                                    buf =  Buffer.from(JSON.stringify([a2,b3,c3]));
                                    this.outputs.push(buf);

                                    //3:3:3 objects
                                    buf =  Buffer.from(JSON.stringify([a3,b3,c3]));
                                    this.outputs.push(buf);                                    
                                }
                            }                    
                        }
                    }                 
                }
            }
        }
        
        
    }

    oneObj(content, CKarr, i) {
        for (let j = 0; j < Object.keys(content.properties).length; j++) {
            let Parr = Object.keys(content.properties);  //the array of potential properties
            let type = content.properties[Parr[j]];      //the type of the property
            if (content.isA) {
                switch (type) {
                    case "int":
                        //iterate through Interesting32
                        for (let k = 0; k < INTERESTING32.length; k++) {
                            let val = INTERESTING32[k];
                            let a = this.arrPushObj(CKarr[i], Parr[j], val);
                            let buf =  Buffer.from(JSON.stringify(a));
                            this.outputs.push(buf);
                        }
                        break;
                    case "bool":
                        let a = this.arrPushObj(CKarr[i], Parr[j], true);
                        let buf =  Buffer.from(JSON.stringify(a));
                        this.outputs.push(buf);
                        a = this.arrPushObj(CKarr[i], Parr[j], false);
                        buf =  Buffer.from(JSON.stringify(a));
                        this.outputs.push(buf);
                        break;
                    default:
                        //iterate through stringstore
                        for (let k = 0; k < Object.keys( this.stringStore ).length; k++) {
                            let val = this.stringStore.strings[k];
                            let a = this.arrPushObj(CKarr[i], Parr[j], val);
                            let buf =  Buffer.from(JSON.stringify(a));
                            this.outputs.push(buf);
                        }
                        break;
                    
                }
            }else {                    
                switch (type) {                
                        
                    case "int":
                        //iterate through Interesting32
                        for (let k = 0; k < INTERESTING32.length; k++) {
                            let val = INTERESTING32[k];
                            let a = this.PushObj(CKarr[i], Parr[j], val);
                            let buf =  Buffer.from(JSON.stringify(a));
                            this.outputs.push(buf);                            
                        }
                        break;
                    case "bool":
                        let a = this.PushObj(CKarr[i], Parr[j], true);
                        let buf =  Buffer.from(JSON.stringify(a));
                        this.outputs.push(buf);
                        a = this.PushObj(CKarr[i], Parr[j], false);
                        buf =  Buffer.from(JSON.stringify(a));
                        this.outputs.push(buf);
                        break;
                    default:
                        //iterate through stringstore
                        for (let k = 0; k < Object.keys( this.stringStore ).length; k++) {
                            let val = this.stringStore.strings[k];
                            let a = this.PushObj(CKarr[i], Parr[j], val);
                            let buf =  Buffer.from(JSON.stringify(a));
                            this.outputs.push(buf);
                        }
                }               
            }
        }
    }

    twoObj(content, CKarr, i) {
        for (let j1 = 0; j1 < Object.keys(content.properties).length; j1++) {
            for (let j2 = j1+1; j2 < Object.keys(content.properties).length; j2++) {
                let Parr = Object.keys(content.properties);  //the array of potential properties
                let type1 = content.properties[Parr[j1]];      //the type of the property
                let type2 = content.properties[Parr[j2]];      //the type of the property
                for (i in Range(this.lenGet(type1)*this.lenGet(type2))) {
                    let val1 = randGet(type1);
                    let val2 = randGet(type2);
                    let a = this.pushObj2(CKarr[i], Parr[j1], Parr[j2], val1, val2);
                    let b = this.arrPushObj2(CKarr[i], Parr[j1], Parr[j2], val1, val2);
                    let buf =  Buffer.from(JSON.stringify(a));
                    this.outputs.push(buf);
                    buf =  Buffer.from(JSON.stringify(b));
                    this.outputs.push(buf);
                }                    
            }
        }
    }

    threeObj(content, CKarr, i) {
        for (let j1 = 0; j1 < Object.keys(content.properties).length; j1++) {
            for (let j2 = j1+1; j2 < Object.keys(content.properties).length; j2++) {
                for (let j3 = j2+1; j3 < Object.keys(content.properties).length; j3++) {
                    let Parr = Object.keys(content.properties);  //the array of potential properties
                    let type1 = content.properties[Parr[j1]];      //the type of the property
                    let type2 = content.properties[Parr[j2]];      //the type of the property
                    let type3 = content.properties[Parr[j3]];      //the type of the property
                    for (i in Range(this.lenGet(type1)*this.lenGet(type2)*this.lenGet(type3))) {
                        let val1 = randGet(type1);
                        let val2 = randGet(type2);
                        let val3 = randGet(type3);
                        let a = this.pushObj3(CKarr[i], Parr[j1], Parr[j2], Parr[j3], val1, val2, val3);
                        let b = this.arrPushObj3(CKarr[i], Parr[j1], Parr[j2], Parr[j3], val1, val2, val3);
                        let buf =  Buffer.from(JSON.stringify(a));
                        this.outputs.push(buf);
                        buf =  Buffer.from(JSON.stringify(b));
                        this.outputs.push(buf);
                    }                    
                }
            }
        }
    }

    randGet(type) {
        switch (type) {
            case "int":
                return INTERESTING32[Math.floor(Math.random() * INTERESTING32.length)];
            case "bool":
                return Math.random() >= 0.5;
            default:
                return this.stringStore.strings[Math.floor(Math.random() * Object.keys( this.stringStore ).length)];
        }
    }

    lenGet(type){
        switch (type) {
            case "int":
                return INTERESTING32.length;
            case "bool":
                return 2;
            default:
                return Object.keys( this.stringStore ).length;
        }
    }

    arrPushObj(CK, Parr, val) {
        let a = {};
        a[CK]=[];
        let i = a[CK];
        let obj = {};
        obj[Parr] = val;
        i.push(obj);
        return a;
        
    }

    pushObj(CK, Parr, val) {
        let a = {};
        a[CK]={};
        let i = a[CK];
        i[Parr] = val;
        return a;
        // let buf =  Buffer.from(JSON.stringify(a));
        // this.outputs.push(buf);
    }    

    arrPushObj2(CK, Parr1, Parr2, val1, val2) {
        let a = {};
        a[CK]=[];
        let i = a[CK];
        let obj1 = {}, obj2 = {};
        obj1[Parr1] = val1;
        obj2[Parr2] = val2;
        i.push(obj1, obj2);
        return a;
        // let buf =  Buffer.from(JSON.stringify(a));
        // this.outputs.push(buf);     
    }

    pushObj2(CK, Parr1, Parr2, val1, val2) {
        let a = {};
        a[CK]={};
        let i = a[CK];
        i[Parr1] = val1;
        i[Parr2] = val2;
        return a;
        // let buf =  Buffer.from(JSON.stringify(a));
        // this.outputs.push(buf);
    }

    arrPushObj3(CK, Parr1, Parr2, Parr3, val1, val2, val3) {
        let a = {};
        a[CK]=[];
        let i = a[CK];
        let obj1 = {}, obj2 = {}, obj3 = {};
        obj1[Parr1] = val1;
        obj2[Parr2] = val2;
        obj3[Parr3] = val3;
        i.push(obj1, obj2, obj3);
        return a;
        // let buf =  Buffer.from(JSON.stringify(a));
        // this.outputs.push(buf);
    }

    pushObj3(CK, Parr1, Parr2, Parr3, val1, val2, val3) {
        let a = {};
        a[CK]={};
        let i = a[CK];
        i[Parr1] = val1;
        i[Parr2] = val2;
        i[Parr3] = val3;
        return a;
        // let buf =  Buffer.from(JSON.stringify(a));
        // this.outputs.push(buf);
    }

    getLength() {
        return this.outputs.length - this.cur - 1;
    }

    generateInput() {
        console.log("in corpus");
        console.log(this.cur);
        return this.outputs[this.cur ++];        
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

let c = new Corpus();

for (i in Range(1000)) {
    console.log(c.generateInput());
}


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