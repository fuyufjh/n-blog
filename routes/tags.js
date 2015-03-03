var express = require('express');
var router = express.Router(),
    User = require('../models/user'),
    Post = require('../models/post');

router.get('/', function (req, res) {
  Post.getAllTags(function(err, tags) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    res.render('tags', {
      title: 'Tags',
      user: req.session.user,
      tags: tags,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.get('/:tag', function (req, res) {
  var tag = req.params.tag;
  Post.getTag(tag, function(err, posts) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    res.render('tag', {
      title: 'Tag: '+tag,
      user: req.session.user,
      posts: posts,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

module.exports = router;
