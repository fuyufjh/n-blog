var express = require('express');
var router = express.Router(),
    User = require('../models/user'),
    Post = require('../models/post');

router.get('/:name/:day/:title', checkLoginUser);
router.get('/:name/:day/:title', function (req, res) {
  Post.remove(req.params.name, req.params.day, req.params.title, function (err, post) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    req.flash('success', 'This article has been deleted!');
    res.redirect('/u/'+req.params.name);
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
