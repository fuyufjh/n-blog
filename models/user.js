/**
 * Created by Fu Yu on 2015/3/1.
 */

var dbPool = require('./db');

function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
}

module.exports = User;

User.prototype.save = function (callback) {
  // Save user's information to database.
  var user = {
    name: this.name,
    password: this.password,
    email: this.email
  };
  dbPool.acquire(function(err, db) {
    if (err) {
      return callback(err);
    }

    db.collection('users', function(err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }

      collection.insert(user, {safe: true}, function(err, user) {
        dbPool.release(db);
        if (err) {
          return callback(err);
        }
        callback(null, user[0]);
      });
    });

  });
};

User.get = function(name, callback) {
  // Read user's information from database.
  dbPool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }

    db.collection('users', function(err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }

      collection.findOne({name: name}, function(err, user) {
        dbPool.release(db);
        if (err) {
          return callback(err);
        }
        callback(null, user);
      });
    });
  });
};

