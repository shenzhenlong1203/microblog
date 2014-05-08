var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');

function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', '未登录');
    return res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', '已登录');
    return res.redirect('/');
  }
  next();
}

/* GET 登录 */
router.get('/login', checkNotLogin);
router.get('/login', function (req, res) {
  res.render('login', {
    title: '用户登录'
  });
});

/* POST 登录 */
router.post('/login', checkNotLogin);
router.post('/login', function (req, res) {
  // 生产密码散列值
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');

  User.get(req.body.username, function (err, user) {
    if (!user) {
      req.flash('error', '用户不存在');
      return res.redirect('/login');
    }

    if (user.password !== password) {
      req.flash('error', '密码错误');
      return res.redirect('/login');
    }

    req.session.user = user;
    req.flash('success', '登录成功');
    res.redirect('/u/' + user.name);
  });
});

/* GET 注册 */
router.get('/reg', checkNotLogin);
router.get('/reg', function (req, res) {
  res.render('reg', {
    title: '注册会员'
  });
});

/* POST 注册 */
router.post('/reg', checkNotLogin);
router.post('/reg', function (req, res) {
  // 检验用户两次输入的密码是否一致
  if (req.body.password_repeat !== req.body.password) {
    req.flash('error', '两次输入的密码不一致');
    return res.redirect('/reg');
  }

  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');

  var newUser = new User({
    name: req.body.username,
    password: password
  });

  User.get(newUser.name, function (err, user) {
    // 检测用户是否存在
    if (user) {
      err = '用户已存在';
    }

    if (err) {
      req.flash('error', err);
      return res.redirect('/reg');
    }

    // 用户不存在新增用户
    newUser.save(function (err) {
      if (err) {
        err.flash('error', err);
        return res.redirect('/reg');
      }
      req.session.user = newUser;
      req.flash('success', '注册成功');
      res.redirect('/u/' + user.name);
    });
  });
});

/* GET 登出*/
router.get('/login', checkLogin);
router.get('/logout', function (req, res) {
  req.session.user = null;
  req.flash('success', '登出成功');
  res.redirect('/');
});

module.exports = router;