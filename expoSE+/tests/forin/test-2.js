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

for (let i in obj){
    if (i === 'hiddenKey'){
        if (obj[i] === 'hiddenValue'){
            throw 'success';
        }
    }
}