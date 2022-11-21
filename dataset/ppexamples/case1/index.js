const express = require("express");
const { open } = require("sqlite");
const sqlite = require("sqlite3");
const hogan = require("hogan.js");

const app = express();
app.use((req, res, next) => {
  res.setHeader("connection", "close");
  next();
});
app.use(express.urlencoded({ extended: true }));

const loadDb = () => {
  return open({
    driver: sqlite.Database,
    filename: "./data.sqlite",
  });
};

const defaults = {
  city: "*",
};

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
<table border="1">
  <thead>
    <tr>
      <th>City</th>
      <th>Pollution index</th>
      <th>Year</th>
    </tr>
  </thead>
  <tbody>
  {{#data}}
    <tr>
      <td>{{city}}</td>
      <td>{{pollution}}</td>
      <td>{{year}}</td>
    </tr>
  {{/data}}
  {{^data}}
    Nothing found
  {{/data}}
  </tbody>
</table>
`;

app.post("/get-data", async (req, res) => {
  const db = await loadDb();
  const reqFilter = req.body;
  const filter = {};
  merge(filter, defaults);
  merge(filter, reqFilter);

  const template = hogan.compile(TEMPLATE);

  const conditions = [];
  const params = [];
  if (filter.city && filter.city !== "*") {
    conditions.push(`city LIKE '%' || ? || '%'`);
    params.push(filter.city);
  }

  if (filter.year) {
    conditions.push("(year = ?)");
    params.push(filter.year);
  }

  const query = `SELECT * FROM data ${
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
  }`;
  const data = await db.all(query, params);
  try {
    return res.send(template.render({ data }));
  } catch (ex) {
  } finally {
    await db.close();
  }
  const f = `return ${template}`;
  try {
    res.json({ error: Function(f)() });
  } catch (ex) {
    res.json({ error: ex + "" });
  }
});

app.use(express.static("./public"));

app.listen(80, () => {
  console.log(`Listening on http://localhost:80`);
});
