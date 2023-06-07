### dataset format

This is work dir for codebases under testing.<br>
This folder should be automatically transformed from ./dataset/testunits/xxx by using script ./script/transfer.sh

The work folder has the structure:
```
template-engines
├── codebase1
│   ├── node_modules
│   │   ├── ...
│   │
│   ├── app-0
│   │   ├── app-0.js
│   │   ├── undefined-props-0.json
│   │   ├── undefined-props-ut.json
│   │   ├── views
│   │   │   ├── template1
│   │   │   ├── template2
│   │   │   ├── ...
│   │
│   ├── app-1
│   ├── ...
│   
├── codebase2
├── ...
```
