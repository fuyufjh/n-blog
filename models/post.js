/**
 * Created by Fu Yu on 2015/3/1.
 */

var mongodb = require('./db');
var markdown = require('markdown').markdown;

function Post(name, title, text) {
  this.name = name;
  this.title = title;
  this.text = text;
}

module.exports = Post;

Post.prototype.save = function(callback) {
  var date = new Date();

  var post = new Post(this.name, this.title, this.text);
  post.time = {
    date: date,
    year: date.getFullYear(),
    month : date.getFullYear() + "-" + (date.getMonth() + 1),
    day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
    minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
  };

  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.insert(post, {safe: true}, function (err) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};

Post.get = function(name, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var query = {};
      if (name) {
        query.name = name;
      }
      collection.find(query).sort({
        time: -1
      }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        // Processing with markdown (to HTML)
        docs.forEach(function(post) {
          post.text = markdown.toHTML(post.text);
        });
        callback(null, docs);
      });
    });
  });
};