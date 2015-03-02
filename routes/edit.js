var express = require('express');
var router = express.Router(),
    User = require('../models/user'),
    Post = require('../models/post');

router.get('/:name/:day/:title', checkLoginUser);
router.get('/:name/:day/:title', function (req, res) {
  Post.getRaw(req.params.name, req.params.day, req.params.title, function (err, post) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    res.render('edit', {
      title: post.title,
      post: post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.post('/:name/:day/:title', checkLoginUser);
router.post('/:name/:day/:title', function(req, res) {
  Post.update(req.params.name, req.params.day, req.params.title, req.body.text, function(err) {
    if (err) {
      req.flash('error', err);
    } else {
      req.flash('success', 'Article updated!');
    }
    var url = encodeURI('/u/'+req.params.name+'/'+req.params.day+'/'+req.params.title);
    res.redirect(url);
  });
});

module.exports = router;

function checkLoginUser(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'Not login!');
    return res.redirect('/login');
  }
  if (req.session.user.name != req.params.name) {
    req.flash('error', 'You are not the author of this article.');
    var url = encodeURI('/u/'+req.params.name+'/'+req.params.day+'/'+req.params.title);
    return res.redirect(url);
  }
  next();
}
