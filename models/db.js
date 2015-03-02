/**
 * Created by Fu Yu on 2015/3/1.
 */

var settings = require('../settings'),
    mongodb = require('mongodb');

var Db = function() {
  return new mongodb.Db(settings.db, new mongodb.Server(
          settings.host, settings.port), {safe: true, poolSize: 1}
  );
};

var poolModule = require('generic-pool');
var pool = poolModule.Pool({
  name     : 'dbPool',
  create   : function(callback) {
    var mongodb = Db();
    mongodb.open(function (err, db) {
      callback(err, db);
    })
  },
  destroy  : function(mongodb) {
    mongodb.close();
  },
  max      : 100,
  min      : 2,
  idleTimeoutMillis : 30000
});

module.exports = pool;