/**
 * Created by Fu Yu on 2015/3/1.
 */

var dbPool = require('./db');

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
  post.pv = 0;

  dbPool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function (err, collection) {
      if (err) {
        dbPool.release(db);
        return callback(err);
      }
      collection.insert(post, {safe: true}, function (err) {
        dbPool.release(db);
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};

Post.getAll = function(name, callback) {
  dbPool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        dbPool.release(db);
        return callback(err);
      }
      var query = {};
      if (name) {
        query.name = name;
      }
      collection.find(query).sort({
        time: -1
      }).toArray(function (err, docs) {
        dbPool.release(db);
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};

Post.getAllOnePage = function(name, page, callback) {
  dbPool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        dbPool.release(db);
        return callback(err);
      }
      var query = {};
      if (name) {
        query.name = name;
      }
      collection.count(query, function (err, total) {
        if (err) {
          dbPool.release(db);
          return callback(err);
        }
        collection.find(query, {
          skip: (page - 1) * 10,
          limit: 10
        }).sort({
          time: -1
        }).toArray(function (err, docs) {
          dbPool.release(db);
          if (err) {
            return callback(err);
          }
          callback(null, docs, total);
        });
      });
    });
  });
};

Post.getOne = function(name, day, title, callback) {
  dbPool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        dbPool.release(db);
        return callback(err);
      }
      var query = {
        name: name,
        'time.day': day,
        title: title
      };
      collection.findOne(query, function (err, doc) {
        if (err) {
          dbPool.release(db);
          return callback(err);
        }
        collection.update({_id: doc._id}, {
          $inc: {pv: 1}
        }, function(err) {
          dbPool.release(db);
          if (err) {
            return callback(err);
          }
          callback(null, doc);
        });
      });
    });
  });
};

Post.getRaw = function(name, day, title, callback) {
  dbPool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        dbPool.release(db);
        return callback(err);
      }
      var query = {
        name: name,
        'time.day': day,
        title: title
      };
      collection.findOne(query, function (err, doc) {
        dbPool.release(db);
        if (err) {
          return callback(err);
        }
        callback(null, doc);
      });
    });
  });
};

Post.update = function(name, day, title, text, callback) {
  dbPool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        dbPool.release(db);
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
        dbPool.release(db);
        callback(err);
      });
    });
  });
};

Post.remove = function(name, day, title, callback) {
  dbPool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        dbPool.release(db);
        return callback(err);
      }
      var selector = {
        name: name,
        'time.day': day,
        title: title
      };
      collection.remove(selector, {w: 1}, function(err) {
        dbPool.release(db);
        callback(err);
      });
    });
  });
};

Post.getArchive = function(callback) {
  dbPool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        dbPool.release(db);
        return callback(err);
      }
      collection.find({}, {
        name: 1,
        time: 1,
        title: 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        dbPool.release(db);
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};

Post.search = function(keyword, callback) {
  dbPool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        dbPool.release(db);
        return callback(err);
      }
      collection.find({
        title: RegExp(keyword, 'i')
      }, {
        name: 1,
        time: 1,
        title: 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        dbPool.release(db);
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};