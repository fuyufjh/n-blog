var express = require('express');
var router = express.Router(),
    User = require('../models/user'),
    Post = require('../models/post');

router.get('/:name', function(req, res) {
  User.get(req.params.name, function(err, user) {
    if (!user) {
      req.flash('error', 'No such user!');
      return res.redirect('/');
    }
    Post.getAll(user.name, function(err, posts) {
      if (err) {
        req.flash('error', err);
        posts = [];
      }
      res.render('user', {
        title: user.name,
        user: req.session.user,
        posts: posts,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
});

router.get('/:name/:day/:title', function (req, res) {
  Post.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    res.render('article', {
      title: post.title,
      post: post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

module.exports = router;
