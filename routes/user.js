var express = require('express');
var router = express.Router(),
    User = require('../models/user'),
    Post = require('../models/post'),
    Comment = require('../models/comment');

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

router.post('/:name/:day/:title', function (req, res) {
  Post.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
    if (err) {
      req.flash('error', err);
      return res.redirect('back');
    }
    /*res.render('article', {
      title: post.title,
      post: post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });*/
    var post_id = post._id;
    var comment = new Comment(post_id, req.body.name, req.body.email, req.body.website, req.body.content);
    comment.save(function(err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      req.flash('success', 'Comment successfully!');
      var url = encodeURI('/u/'+req.params.name+'/'+req.params.day+'/'+req.params.title);
      return res.redirect(url);
    });
  });
});

module.exports = router;
