const express = require('express');
const morgan = require('morgan');
const {urlDatabase, users} = require('./database')

const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;
 
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

// Function to generate random ID for URL / User ID
const generateRandomString = function() {
  // creates random 6 character long alphanumeric string
  return Math.random().toString(36).substring(2, 8);
};


//Function to see if user already is registered in the user database
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
/////////////////////////////////////////////////////////////////////////////////////




// Posts our long and short urls to a table
app.get("/urls", (req, res) => {
  //checks if user is not logged in and if not will route them to the login page
  if(!req.cookies["user_id"]) {
   return res.redirect('/urls/login');
  }

  // function creates a specific database so users can only see their saved urls
  const urlsForUser = function(data){
    let newObj = {}
    for(let key in urlDatabase) {
      if(urlDatabase[key].userID === req.cookies["user_id"]) {
        newObj[key] = urlDatabase[key]
      }
    }
    return newObj;
  }
  //Execute function to create new database
  const newData = urlsForUser(urlDatabase)
  const exports = { username: users[req.cookies["user_id"]].email, urls: newData };
  res.render("urls_index", exports);
});






//Gets the page for urls_new
app.get("/urls/new", (req, res) => {
  //if user is not logged in redirect them to login
  if(!req.cookies["user_id"]) {
    return res.redirect("/urls/login")
  }

  const exports = { username: users[req.cookies["user_id"]].email};
  res.render("urls_new", exports);
});





//gets the registration page for new users
app.get("/urls/register", (req, res) => {
  const exports = { username: users[req.cookies["user_id"]], urls: urlDatabase };
  
  //If user is already logged in it sends them to their URLs table
  if(req.cookies["user_id"]) {
    return res.redirect("/urls/")
  }

  res.render("urls_register", exports);
});





//gets the login page
app.get("/urls/login", (req, res) => {
  const exports = { username: users[req.cookies["user_id"]], urls: urlDatabase };

  //if user is already logged in it redirects to the URLS table
  if(req.cookies["user_id"]) {
    return res.redirect("/urls/")
  }

  res.render("urls_login", exports);
});





//gets the page to show show the long URL for given short URL
app.get("/urls/:id", (req, res) => {
  
  const id = req.params.id;

  //If user is not logged in sends a message asking them to login
  if(!req.cookies["user_id"]){
    return res.send("You must log in first");
  }
  //If user gives invalid short URL sends message that it does not exist
  if(!urlDatabase[id]) {
    return res.send("This URL does not exist");
  }
  //If the short URL does not belong to logged in user it tells them with a message
  if(req.cookies["user_id"] !== urlDatabase[id].userID){
    return res.send("You do not own this URL");
  }

  const exports = { username: users[req.cookies["user_id"]].email, id: id, longURL: urlDatabase[id].longURL};
  res.render("urls_show", exports);
});







//User inputs url and is redirected to short URL page
app.post("/urls", (req, res) => {
  //If user is not logged in it asks them to login first
  if(!req.cookies["user_id"]) {
    return res.send("You must log in first");
   }

  let id = generateRandomString();
  urlDatabase[id] = { longURL: req.body.longURL, userID: users[req.cookies['user_id']].id };
  res.redirect(`/urls/${id}`);
});






// When user clicks short URL they are redirected to the longURL website
app.get("/u/:id", (req, res) => {
  //longURL = urlDatabase object[short Url ID key][longURL]
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});






// Delete button created for links and deletes from urlDatabase obj
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;

  //If URL does not exist command prints error
  if(!urlDatabase[id]) {
    return res.send("This URL does not exist");
  }
  //If user is not logged in command line prints error
  if(!req.cookies["user_id"]){
    return res.send("You must log in first");
  }
  //If user does not own URL command line prints error
  if(req.cookies["user_id"] !== urlDatabase[id].userID){
    return res.send("You do not own this URL");
  }
  //when user clicks it deletes this url from the urlDatabase
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});




// Allows user to update the old long URL
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;

  //If user is not logged in commant line prints error
  if(!req.cookies["user_id"]){
    return res.send("You must log in first");
  }

  //If url does not exist command line prints error
  if(!urlDatabase[id]) {
    return res.send("This URL does not exist");
  }
  
  //if user does not own url command line prints error
  if(req.cookies["user_id"] !== urlDatabase[id].userID){
    return res.send("You do not own this URL");
  }
  
  urlDatabase[id].longURL = req.body.longURL;
  res.redirect('/urls/');
});






//Create a login and save it as a cookie
app.post('/login', (req, res) => {
  const {email, password} = req.body;
 
  //finds the user in the database
  const userLogin = findUserByEmail(email)

  //If their email and password match it redirects to the urls table 
  if(userLogin && userLogin.password === password) {
   //saves their login as a cookie
    res.cookie('user_id', userLogin.id)
    console.log(userLogin)
    return res.redirect('/urls/')
  }
  //If password/email are not right it tells the, they are not authorized
  res.status(403).send('Not authorized');
});





//logs user out and clears the login cookie
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls/login');
});






//Gets the page for a new user to register
app.post('/register', (req, res) => {
  //creates a random ID for the new user
  const randomUserID = generateRandomString();
  
  //If user emtry email or password are blank it tells them to enter a valid one
  if(!req.body.email || !req.body.password) {
    return res.status(401).send('Error: must enter valid email or password');
  }
  //Checks if user lready exists in the database
  for(let user in users) {
    if(req.body.email === users[user].email){
      return res.status(404).send('User already exists');
    }
  }

  //Puts the new user into the users database
  users[randomUserID] = {
    id: randomUserID, 
    email: req.body.email, 
    password: req.body.password
  };
  //saves their unique id as a cookie
  res.cookie('user_id', users[randomUserID].id)
  res.redirect('/urls');
})





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
  res.send("<html><body>Hello <b>World</br><body></html>\n")
});

