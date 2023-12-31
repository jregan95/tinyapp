const express = require('express');
const {urlDatabase, users} = require('./database');
const {makeTodaysDate, ensureUrlProtocol, generateRandomString, findUserByEmail, urlsForUser} = require('./helper');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { use } = require('chai');
const app = express();
const PORT = 8080;
 
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['purple', 'dog', 'cat'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));




/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////




// GET the url table page. If user is logged in a table will display their specific url info.
app.get("/urls", (req, res) => {
  //Declares userCookie as the cookie-sessions cookie
  let userCookie = req.session.userId;

  //checks if user is not logged in and if not will route them to the login page
  if (!userCookie) {
    return res.redirect('/login');
  }
  
  //Execute function to create new database
  const newData = urlsForUser(urlDatabase, userCookie);
  
  const exports = { username: users[userCookie].email, urls: newData };
  res.render("urls_index", exports);
});






//GET the page for users to create a new url
app.get("/urls/new", (req, res) => {
  //Declares userCookie as the cookie-sessions cookie
  const userCookie = req.session.userId;

  //if user is not logged in redirect them to login
  if (!userCookie) {
    return res.redirect("/login");
  }
  
  const exports = { username: users[userCookie].email};
  res.render("urls_new", exports);
});





//gets the registration page for new users
app.get("/register", (req, res) => {
  const userCookie = req.session.userId;
  const exports = { username: users[userCookie], urls: urlDatabase };
  
  //If user is already logged in it sends them to their URLs table
  if (userCookie) {
    return res.redirect("/urls/");
  }

  res.render("urls_register", exports);
});





//GET the login page
app.get("/login", (req, res) => {
  const userCookie = req.session.userId;
  const exports = { username: users[userCookie], urls: urlDatabase };

  //if user is already logged in it redirects to the URLS table
  if (userCookie) {
    return res.redirect("/urls/");
  }

  res.render("urls_login", exports);
});





//GET the page to show show the long URL for given short URL
app.get("/urls/:id", (req, res) => {
  const userCookie = req.session.userId
  const id = req.params.id;

  //If user is not logged in sends a message asking them to login
  if (!userCookie) {
    return res.send("You must log in first");
  }
  //If user gives invalid short URL sends message that it does not exist
  if (!urlDatabase[id]) {
    return res.send("This URL does not exist");
  }
  //If the short URL does not belong to logged in user it tells them with a message
  if (userCookie !== urlDatabase[id].userID) {
    return res.send("You do not own this URL");
  }

  const exports = { username: users[userCookie].email, id: id, longURL: urlDatabase[id].longURL};
  res.render("urls_show", exports);
});







//User inputs url and is redirected to short URL page
app.post("/urls", (req, res) => {
  const userCookie = req.session.userId;
  //If user is not logged in it asks them to login first
  if (!userCookie) {
    return res.send("You must log in first");
  }

  let userUrl = req.body.longURL;
  const checkedUrl = ensureUrlProtocol(userUrl)

  let id = generateRandomString();

  let todaysDate = makeTodaysDate();
  urlDatabase[id] = { longURL: checkedUrl, userID: users[userCookie].id, date: todaysDate };
  res.redirect(`/urls/${id}`);
});






// When user clicks short URL they are redirected to the longURL website
app.get("/u/:id", (req, res) => {
  //longURL = urlDatabase object[short Url ID key][longURL]
  
  if (!urlDatabase[req.params.id]) {
    return res.send("This URL does not exist");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});
 





// Delete button created for links and deletes from urlDatabase obj
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const userCookie = req.session.userId;
  //If URL does not exist command prints error
  if (!urlDatabase[id]) {
    return res.send("This URL does not exist");
  }
  //If user is not logged in command line prints error
  if (!userCookie) {
    return res.send("You must log in first");
  }
  //If user does not own URL command line prints error
  if (userCookie !== urlDatabase[id].userID) {
    return res.send("You do not own this URL");
  }
  //when user clicks it deletes this url from the urlDatabase
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});




// Allows user to update the old long URL
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const userCookie = req.session.userId;
  //If user is not logged in commant line prints error
  if (!userCookie) {
    return res.send("You must log in first");
  }

  //If url does not exist command line prints error
  if (!urlDatabase[id]) {
    return res.send("This URL does not exist");
  }
  
  //if user does not own url command line prints error
  if (userCookie !== urlDatabase[id].userID) {
    return res.send("You do not own this URL");
  }
  const usersUrl = req.body.longURL;
  const checkedUrl = ensureUrlProtocol(usersUrl)
  urlDatabase[id].longURL = checkedUrl;
  res.redirect('/urls/');
});






//Create a login and save it as a cookie
app.post('/login', (req, res) => {

  const {email, password} = req.body;

  if(!email || !password) {
    res.status(403).send('Please fill out both email and password fields');
  }
  //finds the user in the database
  const userLogin = findUserByEmail(email, users);
  

  if (!userLogin) {
    res.status(403).send('Not authorized: No user found');
  }

  //If their  email and password match it redirects to the urls table
  if (bcrypt.compareSync(password, userLogin.password)) {
    //saves their login as a cookie
    req.session.userId = userLogin.id;
    return res.redirect('/urls/');
  }
  //If password/email are not right it tells the, they are not authorized
  res.status(403).send('Not authorized');
});





//logs user out and clears the login cookie
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});






//Gets the page for a new user to register
app.post('/register', (req, res) => {
  //creates a random ID for the new user
  const randomUserID = generateRandomString();
  
  //If user emtry email or password are blank it tells them to enter a valid one
  if (!req.body.email || !req.body.password) {
    return res.status(401).send('Error: must enter valid email or password');
  }
  //Checks if user lready exists in the database
  for (let user in users) {
    if (req.body.email === users[user].email) {
      return res.status(404).send('User already exists');
    }
  }

  
  const salt = bcrypt.genSaltSync(10);
  const hashed = bcrypt.hashSync(req.body.password, salt);
  //Puts the new user into the users database
  users[randomUserID] = {
    id: randomUserID,
    email: req.body.email,
    password: hashed
  };

  //saves their unique id as a cookie
  req.session.userId = users[randomUserID].id;
  res.redirect('/urls');
});





/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////


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
  res.send("<html><body>Hello <b>World</br><body></html>\n");
});

