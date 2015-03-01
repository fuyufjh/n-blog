var express = require('express');
var crypto = require('crypto');

var router = express.Router(),
    User = require('../models/user'),
    Post = require('../models/post');

router.get('/', function(req, res) {
  Post.get(null, function (err, posts) {
    if (err) {
      req.flash('error', err);
      posts = [];
    }
    res.render('index', {
      title: 'Index',
      user: req.session.user,
      posts: posts,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res) {
  res.render('reg', {
    title: 'Register',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res) {
  var name = req.body.name,
      password = req.body.password,
      password_re = req.body['password-repeat'],
      email = req.body.email;

  if (password != password_re) {
    req.flash('error', 'Two passwords you gave did not meet.');
    return res.redirect('/reg');
  }

  var md5 = crypto.createHash('md5');
  password = md5.update(password).digest('hex');

  var newUser = new User({
    name: name,
    password: password,
    email: email
  });

  User.get(newUser.name, function(err, user) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    if (user) {
      req.flash('error', 'User already exists!');
      return res.redirect('/reg');
    }

    newUser.save(function(err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/reg');
      }
      req.session.user = user;
      req.flash('success', 'Register Succeeded!');
      res.redirect('/');
    });
  });
});

router.get('/login', checkNotLogin);
router.get('/login', function(req, res) {
  res.render('login', {
    title: 'Login',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()});
});

router.post('/login', checkNotLogin);
router.post('/login', function(req, res) {
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('hex');

  User.get(req.body.name, function(err, user) {
    if (!user) {
      req.flash('error', 'No such user!');
      return res.redirect('/');
    }
    if (user.password != password) {
      req.flash('error', 'Incorrect password!');
      return res.redirect('/login');
    }
    req.session.user = user;
    req.flash('success', 'Login succeed!');
    res.redirect('/');
  });
});

router.get('/post', checkLogin);
router.get('/post', function(req, res) {
  res.render('post', {
    title: 'Post',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/post', checkLogin);
router.post('/post', function(req, res) {
  var currentUser = req.session.user,
      post = new Post(currentUser.name, req.body.title, req.body.text);
  post.save(function(err) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    req.flash('success', 'Your article has been post!');
    res.redirect('/');
  });
});

router.get('/logout', checkLogin);
router.get('/logout', function(req, res) {
  req.session.user = null;
  req.flash('success', 'Logout succeed!');
  res.redirect('/');
});

router.get('/upload', checkLogin);
router.get('/upload', function(req, res) {
  res.render('upload', {
    title: 'Upload',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/upload', checkLogin);
router.post('/upload', function (req, res) {
  req.flash('success', 'File(s) uploaded!');
  res.redirect('/upload');
});

module.exports = router;

function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'Not login!');
    res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', 'Already login!');
    res.redirect('back');
  }
  next();
}