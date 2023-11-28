const express = require('express');
const app = express();
const PORT = 8080;
 
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
 }
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// Posts our long anf short urls to a table
app.get("/urls", (req, res) => {
  const urlsTable = { urls: urlDatabase };
  res.render("urls_index", urlsTable);
});

//Gets the page for urls_new
app.get("/urls/new", (req, res) => {
  console.log(req.body)
  res.render("urls_new");
});


//gets the page to show show the long URL for given short URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id
  const logURL = { id: id, longURL: urlDatabase[id]};
  res.render("urls_show", logURL);
});

//User inputs url and is redirected to short URL page
app.post("/urls", (req, res) => {
  let id = generateRandomString()
  urlDatabase[id] = req.body.longURL;
  console.log(urlDatabase);
  
  res.redirect(`/urls/${id}`); 
});

//redirect link
app.get("/u/:id", (req, res) => {

  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
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

