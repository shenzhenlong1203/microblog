var express = require('express');
var router = express.Router();
var Post = require('../models/post');

/* GET 首页 */
router.get('/', function (req, res) {
  Post.get(null, function (err, posts) {
    if (err) {
      posts = [];
    }
    
    res.render('index', {
      title: 'Microblog',
      posts: posts
    });
  });
});

module.exports = router;
