// currProp = 'hello'
// banned = []
// Object.defineProperty(
//     Object.prototype, 
//     currProp, { 
//       get: function() { 
//         if(this[currProp + "cs"]){
//             return this[currProp + "cs"]; 
//         }
//         if (!banned.includes(currProp)){
//             console.log(currProp + ' has been visited!')
//             // accessed.add(currProp); // or log the info about an access attempt
//             return undefined; 
//         }
//       }, 
//       set: function(val){ 
//         this[currProp + "cs"] = val;
//       } 
//     }
// );

// Object.prototype.__defineGetter__('block', ()=>{
//     console.log('block property has been looked up!');
//     return undefined;
// })

a = {}
if(a.block){
    console.log('still coming in!')
}