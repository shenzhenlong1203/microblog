var express = require('express');
var session = require('express-session');
var connect = require('connect');
var MongoStore = require('connect-mongo')(connect);
var flash = require('connect-flash');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var settings = require('./settings');

// 应用路由
var route_index = require('./routes/index');
var route_users = require('./routes/users');
var route_reg = require('./routes/reg');
var route_post = require('./routes/post');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(flash());
app.use(session({
  secret: settings.cookieSecret,
  store: new MongoStore({
    db: settings.db
  })
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', route_index);
app.use('/', route_reg); 
app.use('/u', route_users);
app.use('/post', route_post);

// 捕获 404
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// 开发环境 错误处理
// 输出堆栈信息
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// 生产环境 错误处理
// 不输出堆栈信息
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
