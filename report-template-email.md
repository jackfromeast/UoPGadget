Email Title: potential security issue found in <XXX> and request for confirmation

Hi there! 

We hope this message finds you well!

We are a group of students from Hopkins conducting a study on the exploitation of prototype pollution vulnerabilities within JavaScript. And we've identified several prototype pollution gadgets within the <XXX> template engine that could potentially be leveraged by attackers to achieve remote code execution via prototype pollution vulnerabilities. 

**In light of our findings, we kindly request your confirmation of these potential issues. We would greatly appreciate any steps taken to address them and we stand ready to submit a pull request on the GitHub repository to help improve the security for all users of your excellent work.**

## Root Cause
The existence of these gadgets can be attributed to a specific programming practice. When checking for the presence of a property within an object variable, the lookup scope isn't explicitly defined. In JavaScript, the absence of a defined lookup scope prompts a search up to the root prototype (Object.prototype). This could potentially be under the control of an attacker if other prototype pollution vulnerabilities are present within the application.

Some vulnerable coding patterns are as follows.
```
if(obj.prop){ //... }
var x = obj.prop || ''
```

## Impact
If the application server is using the <XXX> as the backend template engine, and there is another prototype pollution vulnerability in the application, then the attacker could leverage the found gadgets in the <XXX> template engine to escalate the prototype pollution to remote code execution.

## Proof of Concept
Below, I present a Proof of Concept (PoC) to demonstrate the identified gadgets within the <XXX> template engine. The first gadget has been previously discovered by others, while the remaining gadgets are my own findings.

The <XXX> version currently in use is ^2.6.2.

### Gadget 1
```

```

## General Suggested Fix
To mitigate this issue, I recommend constraining the property lookup to the current object variable. This can be achieved by utilizing the hasOwnProperty method, particularly when there's no requirement to traverse through the prototype chain.
```
if(obj.hasOwnProperty('prop')){ //... }
var x = obj.hasOwnProperty('prop') ? obj.prop : ''
```
By adopting this practice, we can effectively prevent the potential exploitation of prototype pollution vulnerabilities.