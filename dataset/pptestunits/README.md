### Dataset format

This folder saves the all testunits for each the codebase under testing. <br>
This folder is *not* the work dir but serves as the database that store all the test units we have used in this project.

This folder has the structure:

```
pptestunits
├── codebase1
│   ├── node_modules
│   ├── views
│   │   ├── template1
│   │   ├── template2
│   │   ├── ...
│   ├── app-0.js
│   ├── app-1.js
│   ├── app-2.js
│   ├── ...
├── codebase2
├── ...
```

### Notes
Please follow the rules that: <br>
1. the template either placed in the ./views folder or hardcoded in the test file.
2. the test file should be named as app-*.js
3. do not try to call the generated function