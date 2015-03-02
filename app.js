var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var multer = require('multer');

var routes = require('./routes/index');
var settings = require('./settings');
var MongoStore = require('connect-mongo')(session);
var routesUser = require('./routes/user');
var routesEdit = require('./routes/edit');
var routesRemove = require('./routes/remove');
var routesArchive = require('./routes/archive')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,
  cookie: {maxAge: 1000*60*60*24*30},
  store: new MongoStore({
    db: settings.db,
    host: settings.host,
    port: settings.port
  })
}));
app.use(flash());
app.use(multer({
  dest: './public/images',
  rename: function(fieldname, filename) {
    return filename;
  }
}));

app.use('/', routes);
app.use('/u', routesUser);
app.use('/remove', routesRemove);
app.use('/edit', routesEdit);
app.use('/archive', routesArchive);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('404');
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
