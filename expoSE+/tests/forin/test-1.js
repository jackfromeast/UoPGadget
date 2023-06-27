try{
    Object._expose.setupSymbols()
}
catch(e){
    console.log("[!] symbolic execution not enabled")
}

let obj = {
    a: 1,
    b: 2,
    c: 3
}

obj2 = [];

for (let i in obj){
    if (obj[i] === 'hiddenValue'){
        obj2.push(i);
    }
}

for (let j of obj2){
    if (j === 'hiddenKey'){
        throw 'success';
    }
}