var express = require('express');
var router = express.Router(),
    User = require('../models/user'),
    Post = require('../models/post');

router.get('/', function (req, res) {
  Post.getArchive(function(err, posts) {
    if (err) {
      req.flash('error', err);
      return res.redirect('back');
    }
    res.render('archive', {
      title: 'Archive',
      user: req.session.user,
      posts: posts,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

module.exports = router;