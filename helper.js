// Functions used in the server


// Function to generate random ID for URL / User ID
const generateRandomString = function() {
  // creates random 6 character long alphanumeric string
  return Math.random().toString(36).substring(2, 8);
};


//Function to see if user already is registered in the user database
const findUserByEmail = (email, database) => {
  for (let id in database) {
    if (database[id].email === email) {
      // user exists
      return database[id];
    }
  }
  // user does not exist
  return false;
};

const urlsForUser = function(data, cookieInfo) {
  let newObj = {};
  for (let key in data) {
    if (data[key].userID === cookieInfo) {
      newObj[key] = data[key];
    }
  }
  return newObj;
};

//Checks to ensure users put a protocol before Url
const ensureUrlProtocol = function(url) {

  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('ftp://')) {
  return url;
  }
  return `http://${url}`;
  
}



module.exports = {generateRandomString, findUserByEmail, urlsForUser, ensureUrlProtocol};