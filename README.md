# AEG for Prototype Pollution

![logo](https://github.com/jackfromeast/PPAEG/blob/master/.assets/ppaeg.logo.png)

Please refer to [our wiki page](https://github.com/jackfromeast/PPAEG/wiki/home) for more information!

## Installment

If this system is still a private repo, please follow the link and clone the repo through your github token:

```
git clone https://<your_private_token>@github.com/jackfromeast/ppaeg.git
```

#### install node v14

install nvm to control the nodejs version:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
source ~/.bashrc
nvm install 14
```

#### install codeql
CodeQL need to be installed for two reason: 1/ compared with slient-spring 2/could us find the sink in the codebase as an prelimiary selection.
I recommand install both codeql cli and codeql plugin for vscode.

To download the codeql cli, we can just download its release file:
```
cd ~/
wget https://github.com/github/codeql-cli-binaries/releases/download/v2.13.3/codeql-linux64.zip
```

Setup the codeql database for each codebase placed in the ./dataset/ppaeg-codeql:
```
bash ./dataset/ppaeg-codeql/createCodeQLdb.sh
```


#### Install the dependency of each compoent

download dependency for codebases in the dataset at different location:

````
bash ./scripts/npm-install.sh ./dataset/ppgadgets
bash ./scripts/npm-install.sh ./dataset/pptestunits
bash ./scripts/npm-install.sh /home/ubuntu/ppaeg/expoSE+/pptests/template_engines
````

To set the dependency for ExpoSE+:
```
sudo apt-get update
sudo apt-get install build-essential

cd expoSE+
npm install # this will take 20 mins

cd node_modules/z3javascript
run npm build
```

