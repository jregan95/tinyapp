const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;
 
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");


const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  '24gh67': {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  '67hsy7': {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};




// Posts our long anf short urls to a table
app.get("/urls", (req, res) => {
  const exports = { username: req.cookies["user_id"].email, urls: urlDatabase };
  res.render("urls_index", exports);
});

//Gets the page for urls_new
app.get("/urls/new", (req, res) => {
  const exports = { username: req.cookies["user_id"].email };
  
  res.render("urls_new", exports);
});

//registration page
app.get("/urls/register", (req, res) => {
  const exports = { username: req.cookies["user_id"].email, urls: urlDatabase };
  res.render("urls_register", exports);
});


//gets the page to show show the long URL for given short URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const exports = { username: req.cookies["username"], id: id, longURL: urlDatabase[id]};
  res.render("urls_show", exports);
});

//User inputs url and is redirected to short URL page
app.post("/urls", (req, res) => {
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

//redirect link
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// Delete button created for links and deletes from urlDatabase obj
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// Update URL
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect('/urls/');
});

//Create a login and save it as a cookie
app.post('/login', (req, res) => {
  let loginID = req.body.username;
  res.cookie('username', loginID);
  res.redirect('/urls/');
});

//logs userout and clears the login cookie
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls/');
});

app.post('/register', (req, res) => {
  const randomUserID = generateRandomString()
  users[randomUserID] = {
    id: randomUserID, 
    email: req.body.email, 
    password: req.body.password
  };
  res.cookie('user_id', users[randomUserID])
  console.log(users)
  res.redirect('/urls');

})

/////////////////////////////////////////////////////////////////////////////
//pass the username to all templates
//app.get("/urls", (req, res) => {
  //const templateVars = {key: 'test'};
  //res.render("urls_index", templateVars);
//});


app.get('/', (req, res) => {
  res.send("Hello");
});

app.listen(PORT, () => {
  console.log(`Example app listening on PORT ${8080}`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</br><body></html>\n")
});

