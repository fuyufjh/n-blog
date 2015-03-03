var express = require('express');
var router = express.Router(),
    User = require('../models/user'),
    Post = require('../models/post');

router.get('/:name/:day/:title', checkLoginUser);
router.get('/:name/:day/:title', function (req, res) {
  Post.getRaw(req.params.name, req.params.day, req.params.title, function (err, post) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/');
    }
    res.render('edit', {
      title: 'Edit',
      post: post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.post('/:id', checkLoginUser);
router.post('/:id', function(req, res) {
  var post_id = req.params.id,
      tags = req.body.tags.split(/ *, */),
      currentUser = req.session.user,
      post = new Post(currentUser.name, req.body.title, req.body.text, tags);
  post.update(post_id, currentUser.name, function(err) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/');
    }
    req.flash('success', 'Your article has been updated!');
    var url = encodeURI('/u/' + req.body.name + '/' + req.body.date + '/' + req.body.title);
    return res.redirect(url);
  });
});

module.exports = router;

function checkLoginUser(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'Not login!');
    return res.redirect('/login');
  }
  if (req.params.name) { // for the GET method Only
    if (req.session.user.name != req.params.name) {
      req.flash('error', 'You are not the author of this article.');
      var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
      return res.redirect(url);
    }
  }
  next();
}
