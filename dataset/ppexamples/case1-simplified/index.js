const express = require("express");
const hogan = require("hogan.js");

const app = express();
app.use((req, res, next) => {
    res.setHeader("connection", "close");
    next();
});
app.use(express.urlencoded({ extended: true }));

const UNSAFE_KEYS = ["__proto__", "constructor", "prototype"];

const merge = (obj1, obj2) => {
    for (let key of Object.keys(obj2)) {
        if (UNSAFE_KEYS.includes(key)) continue;
        const val = obj2[key];
        key = key.trim();
        if (typeof obj1[key] !== "undefined" && typeof val === "object") {
            obj1[key] = merge(obj1[key], val);
        } else {
            obj1[key] = val;
        }
    }
    return obj1;
};

const TEMPLATE = `
<p1>Template</p1>
`;

app.post("/get-data", async (req, res) => {
    const reqFilter = req.body;
    const filter = {};
    merge(filter, reqFilter);
    const template = hogan.compile(TEMPLATE);
    res.json({ error: Function(`return ${template}`)() });
});

app.listen(80, () => {
    console.log(`Listening on http://localhost:80`);
});
