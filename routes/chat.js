var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  if (req.session.user || req.query.user) {
    var name = req.session.user ? req.session.user.name : req.query.user;
    res.render('chatroom', {
      title: 'Chatroom',
      name: name,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  }
  // else you need to login first
  res.render('chatLogin', {
    title: 'Chatroom',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

module.exports = router;
