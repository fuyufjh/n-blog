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
  post.comments = [];

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

Post.getAll = function(name, callback) {
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

Post.getOne = function(name, day, title, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var query = {
        name: name,
        'time.day': day,
        title: title
      };
      collection.findOne(query, function (err, doc) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        // Processing with markdown (to HTML)
        doc.text = markdown.toHTML(doc.text);
        if (!doc.comments) { // for older version without comments
          doc.comments = [];
        }
        doc.comments.forEach(function (comment) {
          comment.content = markdown.toHTML(comment.content);
        });
        callback(null, doc);
      });
    });
  });
};

Post.getRaw = function(name, day, title, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var query = {
        name: name,
        'time.day': day,
        title: title
      };
      collection.findOne(query, function (err, doc) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, doc);
      });
    });
  });
};

Post.update = function(name, day, title, text, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var selector = {
        name: name,
        'time.day': day,
        title: title
      };
      collection.update(selector, {
        $set: {text: text}
      }, function(err) {
        mongodb.close();
        callback(err);
      });
    });
  });
};

Post.remove = function(name, day, title, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var selector = {
        name: name,
        'time.day': day,
        title: title
      };
      collection.remove(selector, {w: 1}, function(err) {
        mongodb.close();
        callback(err);
      });
    });
  });
};