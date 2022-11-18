## AEG for Prototype Pollution

### 0 Research Background

#### PPAEG vs. PPDetector

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



### 1 Motivating Example

