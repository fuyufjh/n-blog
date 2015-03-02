/**
 * Created by Fu Yu on 2015/3/2.
 */

var mongodb = require('./db');
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

  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      // Insert new comment to this.comments (an array)
      collection.update({_id: post_id}, {$push: {comments: comment}}, function(err) {
        mongodb.close();
        if (err) {
          callback(null);
        }
        callback(err);
      });
    });
  });
};

Comment.get = function(post_id, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.findOne({_id: post_id}, {comments: 1}, function(err, docs) {
        mongodb.close();
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
