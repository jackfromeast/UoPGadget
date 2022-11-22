# AEG for Prototype Pollution

## 0 Research Background

### PPAEG vs. PPDetector

With the potential vulnerability location known, the AEG tool should be able to construct an attack payload that can reach the vulnerable statement and monitor for the successful execution of the exploitation code in the program.

**An AEG tool should consist of the following: **

1. (VulnDetector) 
2. **PayloadGenerator** 
3. **dynamic analyzer/Fuzzer**
4. **Monitor**

**The main goals of an AEG:**

1. Constructing the attribute values in the payload so that it can successfully enter the correct conditional branch at server runtime, allowing the control flow to reach the sink point.
2. Build the attack payload in the payload so that it can be executed successfully in the current environment (find available gadgets && bypass sanitization).

**Why is AEG necessary:**

1. Let's imagine a scenario. When it comes to code auditing, a direct use of *Static application security testing* (*SAST*) tools would produce more false positives, while a direct use of *Dynamic application security testing* (*DAST*) tools would take an unbearable amount of time before finding anything valuable. So AEG can be used at this point to perform additional analysis for potential vulnerabilities given by the SAST tools. Since the potential vulnerability information is aware, AEG can decide whether the vulnerability can be exploited efficiently.

2. AEG tools play a significant role in the automated attack and defense battlefields like RHG.

**PPDetector**

Current Prototype Pollution Detectors (PPDetector) can be categorized as SAST tools and DAST tools.

+ Static analysis tools typically do not run code directly, but rather evaluate it and create specific representations (control flow graphs, data flow graphs, etc.) to find vulnerabilities. It should be noted that current SAST tools could provide a simple AEG module to help with the evaluation part.

    https://github.com/msrkp/PPScan

+ Dynamic analysis techniques can be also used in finding language-based vulnerabilities but they are not that straightforward. The technology stack of AEG and dynamic analysis tools should be the same, and we can leverage the implementation ideas of these tools. The difference is that our target sink is more clear, and we need to construct the payload so that the vulnerability is successfully triggered and not just the POC(TODO: further verified).

    https://github.com/dwisiswant0/ppfuzz



## 1 Motivating Example

### 1.1 Template-engine related

| index | template                | version      | comments                                                     | app case                             |                            source                            |
| ----- | ----------------------- | ------------ | ------------------------------------------------------------ | ------------------------------------ | :----------------------------------------------------------: |
| 1     | hogan                   | 3.0.2        | gadget found                                                 | air-pollution                        | [air-pollution challenge](https://www.creastery.com/blog/securitymb-october-2021-prototype-pollution-challenge/) |
| 2     | lodash                  | 4.17.4       | gadget found                                                 | codebreaking  2018 thejs             | [phith0n's blog](https://www.leavesongs.com/PENETRATION/javascript-prototype-pollution-attack.html#0x05-code-breaking-2018-thejs) |
| 3     | pug                     | 3.0.2        | gadget found                                                 | deadface ctf 2022 DFRS               | [deadface CTF 2022 writeup](http://jackfromeast.site/2022-10/deadface-ctf-2022-writeup.html) |
| 4     | express-hbs(handlebars) | 1.0.3(4.0.6) | gadget found                                                 | websec assign3                       | cannot be exploited app's pp sink(broken after inject properties) |
|       | handlebars              | unknown      | gadget found                                                 | paper                                | [Prototype pollution attack in NodeJS application](https://repository.root-me.org/Exploitation%20-%20Web/EN%20-%20JavaScript%20Prototype%20Pollution%20Attack%20in%20NodeJS%20-%20Olivier%20Arteau%20-%202018.pdf) |
|       | mustache                | lastest      | known gadgets(caching mechanism)<br />also contain chain prototype pollution | cakeCTF 2022 Panda Memo              | [cakeCTF 2022 writeup][https://ptr-yudai.hatenablog.com/entry/2022/09/04/230612] |
|       | templ8                  | lastest      | known pp; unknown gadgets                                    | —                                    |     https://security.snyk.io/vuln/SNYK-JS-TEMPL8-598770      |
|       | bladejs                 | lastest      | known gadgets                                                | STACK the flags 2022 Final Countdown | [STACK the flags 2020 CTF](https://quanyang.github.io/stack-2020-final-countdown/) |
|       | ejs                     | 2.6.2        | known gadgets                                                | XNUCA2019 qualifier hard js          | [XNUCA2019 qualifier hard js writeup](https://github.com/NeSE-Team/OurChallenges/tree/master/XNUCA2019Qualifier/Web/hardjs)<br />[Another writeup](https://xz.aliyun.com/t/6113) |
|       | jade                    | unknown      | known gadgets                                                | —                                    | [pp2rce vulnerability manual mining blog](https://xz.aliyun.com/t/7025) |
|       | nunjunks                | 3.2.2        | known gadgets                                                | —                                    | [github commit](https://github.com/mozilla/nunjucks/issues/1331) |

**How did i find these gadgets' vulnerabilities?**

1. Google: `template engine js prototype pollution` (security blog, ctf writeup)
2. Visit the issues/commits/changelog of each template engine's GitHub repo
3. CVE/NVD disclosed vulnerabilities

Usually, the gadgets found inside the template render engine might not be identified as vulnerable or assigned a CVE. However, applications with prototype pollution vulnerability that also use these exploitable template render engines will be assigned a critical RCE kind vulnerability.



## 2 Undefined property searching

[finding *undefined* property with Finding Prototype Pollution gadgets with CodeQL](https://jorgectf.github.io/blog/post/finding-prototype-pollution-gadgets-with-codeql/)



## 3 Gadgets finding

Borrowing from the server-side template injection (SSTI) detection methods(the dynamic-based approaches fit more), the only difference is the input source.

