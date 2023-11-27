const express = require('express');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const urlsTable = { urls: urlDatabase };
  res.render("urls_index", urlsTable);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id
  const logID = { id: id, longURL: urlDatabase[id]};
  res.render("urls_show", logID);
});

app.get('/', (req, res) => {
  res.send("Hello");
});

app.listen(PORT, () => {
  console.log(`Example app listening on PORT ${8080}`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</br><body></html>\n")
})