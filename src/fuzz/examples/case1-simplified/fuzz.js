var prototype_ori = JSON.stringify(Object.prototype);

async function fuzz (bytes) {

  // inital prototype
  Object.prototype = JSON.parse(prototype_ori);

  // from bytes to prototype pollution
  let current_payload = JSON.parse(bytes.toString());
  console.log(current_payload);
  for (let key in current_payload) {
    Object.prototype[key] = current_payload[key];
  }

  

  const hogan = require("hogan.js");

  const TEMPLATE = `
  <p1>Template</p1>
  `;
  try {
    const template = hogan.compile(TEMPLATE);
    // moniter
  
    if(template.toString().includes("flag{fuzzing_is_fun!}")){
    console.log("[+] Found a valid payload: " + bytes.toString());
  }
  } catch (e) {
    
  }
  //const template = hogan.compile(TEMPLATE);
  
  // pp2rce sink
  // Function(`return ${template}`)();
  
  
 
}



module.exports = {
  fuzz
};
