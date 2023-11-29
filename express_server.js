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

const findUserByEmail = (email) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      // user exists
      return users[userId];
    }
  }
  // user does not exist
  return false;
};

/////////////////////////////////////////////////////////////////////////////////////


// Posts our long anf short urls to a table
app.get("/urls", (req, res) => {
  if(!req.cookies["user_id"]) {
   return res.redirect('/urls/login');
  }
  const exports = { username: req.cookies["user_id"], urls: urlDatabase };
  res.render("urls_index", exports);
});

//Gets the page for urls_new
app.get("/urls/new", (req, res) => {
  const exports = { username: req.cookies["user_id"] };
  if(!req.cookies["user_id"]) {
    return res.redirect("/urls/login")
  }
  res.render("urls_new", exports);
});

//registration page
app.get("/urls/register", (req, res) => {
  const exports = { username: req.cookies["user_id"], urls: urlDatabase };

  if(req.cookies["user_id"]) {
    return res.redirect("/urls/")
  }
  res.render("urls_register", exports);
});

app.get("/urls/login", (req, res) => {
  const exports = { username: req.cookies["user_id"], urls: urlDatabase };
  if(req.cookies["user_id"]) {
    return res.redirect("/urls/")
  }
  res.render("urls_login", exports);
});


//gets the page to show show the long URL for given short URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const exports = { username: req.cookies["user_id"], id: id, longURL: urlDatabase[id]};
  res.render("urls_show", exports);
});

//User inputs url and is redirected to short URL page
app.post("/urls", (req, res) => {
  if(!req.cookies["user_id"]) {
    return res.send("You must log in first");
   }
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
  const {email, password} = req.body;

  const userLogin = findUserByEmail(email)

  if(userLogin && userLogin.password === password) {
    res.cookie('user_id', userLogin.email)
    return res.redirect('/urls/')
  }
  res.status(403).send('Not authorized');
});

//logs userout and clears the login cookie
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls/login');
});

app.post('/register', (req, res) => {
  const randomUserID = generateRandomString()
  

  if(!req.body.email || !req.body.password) {
    res.status(401).send('Error: must enter valid email')

  }
  for(let user in users) {
  if(req.body.email === users[user].email){
    res.status(404).send('User already exists')
  }
  }

  users[randomUserID] = {
    id: randomUserID, 
    email: req.body.email, 
    password: req.body.password
  };
  res.cookie('user_id', users[randomUserID].email)
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

