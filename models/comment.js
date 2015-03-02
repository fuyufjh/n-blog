/**
 * Created by Fu Yu on 2015/3/2.
 */

var dbPool = require('./db');
var markdown = require('markdown').markdown;

function Comment(post_id, name, email, website, content) {
  this.post_id = post_id;
  this.name = name;
  this.email = email;
  this.website = website;
  this.content = content;
}

module.exports = Comment;

Comment.prototype.save = function(callback) {
  var date = new Date();

  var post_id = this.post_id;
  var comment = {
    name: this.name,
    email: this.email,
    website: this.website,
    content: this.content,
    time: {
      date: date,
      year: date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth() + 1),
      day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }
  };

  dbPool.acquire(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        dbPool.release(db);
        return callback(err);
      }
      // Insert new comment to this.comments (an array)
      collection.update({_id: post_id}, {$push: {comments: comment}}, function(err) {
        dbPool.release(db);
        if (err) {
          callback(null);
        }
        callback(err);
      });
    });
  });
};

Comment.get = function(post_id, callback) {
  dbPool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        dbPool.release(db);
        return callback(err);
      }
      collection.findOne({_id: post_id}, {comments: 1}, function(err, docs) {
        dbPool.release(db);
        if (err) {
          return callback(err);
        }
        docs.forEach(function(doc) {
          doc.content = markdown.toHTML(doc.content);
        });
        callback(null, docs);
      });
    });
  });
};
