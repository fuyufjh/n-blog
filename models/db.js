/**
 * Created by Fu Yu on 2015/3/1.
 */

var settings = require('../settings'),
    mongodb = require('mongodb');

module.exports = new mongodb.Db(settings.db, new mongodb.Server(
    settings.host, settings.port, {safe: true}
));
