const { assert } = require('chai');

const { findUserByEmail } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
   
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return false with no valid email', function() {
    const user = findUserByEmail("invalid@example.com", testUsers);
   
    assert.isFalse(user);
  });

  it('should return false with no email', function() {
    const user = findUserByEmail("", testUsers);
    
   
    assert.isFalse(user);
  });

  it('should return false with a slightly mispelled email', function() {
    const user = findUserByEmail("users@example.com", testUsers);
   
    assert.isFalse(user);
  });

});