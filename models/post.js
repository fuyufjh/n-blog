/**
 * Created by Fu Yu on 2015/3/1.
 */

var dbPool = require('./db');
var ObjectID = require('mongodb').ObjectID;

function Post(name, title, text, tags) {
  this.name = name;
  this.title = title;
  this.tags = tags;
  this.text = text;
}

module.exports = Post;

Post.prototype.save = function(callback) {
  var date = new Date();

  var post = new Post(this.name, this.title, this.text, this.tags);
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
        if (!doc) {
          err = new Error('No such article.');
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

Post.prototype.update = function(post_id, user, callback) {
  var post = {
    title: this.title,
    tags: this.tags,
    text: this.text
  };
  dbPool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        dbPool.release(db);
        return callback(err);
      }
      collection.update({
        _id: new ObjectID(post_id),
        name: user // for auth (user can only update himself's article)
      }, {
        $set: post
      }, function(err, count) {
        dbPool.release(db);
        if (!err && count === 0) { // count==0 means Auth Failure
          err = new Error('Nothing updated.');
        }
        if (err) {
          callback(err);
        }
        callback(null);
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

Post.getTag = function(tag, callback) {
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
        tags: tag
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

Post.getAllTags = function(callback) {
  dbPool.acquire(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        dbPool.release(db);
        return callback(err);
      }
      collection.distinct('tags', {}, function(err, tags) {
        dbPool.release(db);
        if (err) {
          return callback(err);
        }
        callback(null, tags);
      });
    });
  });
};