/**
 * controller
 * @type {*|exports}
 */
var express = require('express');
var router = express.Router();

//var crypto = require('crypto'),
   // User = require('../controllers/user_controller.js'),
   // Post = require('../controllers/post_controller.js'),
   // Comment = require('../models/comment.js');

var User = require('../controllers/user_controller.js');
var Post = require('../controllers/post_controller.js');
var Comment = require('../models/comment.js');

//引入包装MD5加密组件
var md5 = require('../lib/md5.js');

//导入log4js
var logger = require('../log').logger;
var colors = require('../colors');

/* GET home page. */
router.get('/', function(req, res, next) {
  logger.info('-------------------- welcome node express --------------------');
  console.log('------------------- this is my ejsblog --------------------');
  res.render('index', { title: 'Express' });
});

/* GET index page */
router.get('/index', function(req, res){
  logger.info('----------------- 进入首页 ---------------');
  //判断是否是第一页，并把请求的页数转换成 number 类型
  var page = req.query.p ? parseInt(req.query.p) : 1;
  Post.getTen(null, page, function (err, posts, total) {
    if (err) {
      posts = [];
    }
    res.render('home', {
      title: 'Home',
      posts: posts,
      page: page,
      isFirstPage: (page - 1) == 0,
      isLastPage: ((page - 1) * 10 + posts.length) == total,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

//注册GET
router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res){
  console.log('----------------register-------------'.green);
  res.render('register', {
    title: 'register',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

//注册POST
//对代码进行标准化优化
router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res){
  //var name = req.body.name,
     // password = req.body.password,
      //password_re = req.body['password-repeat'];
  var name = req.body.name;//用户名
  var password = req.body.password;//密码
  var password_re = req.body['password-repeat'];//确认密码
  if(password_re != password){
    //设置控制台提示颜色
    console.log('------------两次输入的密码不一致哎！-------------'.error);
    req.flash('error', '两次输入的密码不一致哎！');
    return res.redirect('/reg');//返回注册页
  }
  //生成密码的 md5 值
  //var md5 = crypto.createHash('md5'),
     // password = md5.update(req.body.password).digest('hex');
  password = md5(password);
  var newUser = new User({
    name: name,
    password: password,
    email: req.body.email
  });
  //检查用户名是否存在
  User.get(newUser.name, function(err, user){
    if(err){
      req.flash('error', err);
      return res.redirect('/index');
    }
    if(user){
     req.flash('error', '用户已经存在！');
      return res.redirect('/reg');
    }
    //如果不存在则添加用户
    newUser.save(function(err, user){
      if(err){
       req.flash('error', err);
        return res.redirect('/reg');
      }
      req.session.user = user;//将user保存到当前session
      req.flash('success', '注册成功！');//将成功的状态值赋给success
      res.redirect('/index');
    });
  });
});

router.get('/login', checkNotLogin);
router.get('/login', function(req, res){
  res.render('login', {
    title: 'login',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/login', checkNotLogin);
router.post('/login', function(req, res){
  //生成密码的 md5 值
 // var md5 = crypto.createHash('md5');
      //password = md5.update(req.body.password).digest('hex');
    var password = req.body.password;
  User.get(req.body.name, function(err, user){
      if(!user){
        req.flash('error', '用户不存在！');
        return res.redirect('/login');//跳转到登陆页面，让重新登陆
      }
    //检查输入的密码是否一致
    if(user.password != md5(password)){
      req.flash('error', '密码输入错误！');
      return res.redirect('/login');
    }
    req.session.user = user;
    req.flash('success', '登陆成功！');
    res.redirect('/index');
  });

});

router.get('/post', checkLogin);
router.get('/post', function(req, res){
  res.render('post', {
    title: 'Post',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/post', checkLogin);
router.post('/post', function(req, res){
  var currentUser = req.session.user,
      tags = [req.body.tag1, req.body.tag2, req.body.tag3],
      post = new Post(currentUser.name, currentUser.head, req.body.title, tags, req.body.post);
  post.save(function(err){
    if(err){
      req.flash('error', err);
      return res.redirect('/index');
    }
    req.flash('success', '发布成功');
    res.redirect('/index');//成功以后跳转到首页
  });
});

router.get('/logout', checkLogin);
router.get('/logout', function(req, res){
  req.session.user = null;
  req.flash('success', '注销成功！');
  res.redirect('/login');
});

//upload
router.get('/upload', checkLogin);
router.get('/upload', function(req, res) {
  res.render('upload', {
    title: '文件上传',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/upload', checkLogin);
router.post('/upload', function(req, res){
  req.flash('success', '文件上传成功！');
  res.redirect('/upload');
});

//获取存档
router.get('/archive', function(req, res){
  Post.getArchive(function(err, posts){
    if(err){
      req.flash('error', err);
      return res.redirect('/index');
    }
    res.render('archive', {
      title: '存档',
      posts: posts,
      user : req.session.user,
      success : req.flash('success').toString(),
      error : req.flash('error').toString()
    });
  });
});

//获取标签
router.get('/tags', function(req, res){
  Post.getTags(function(err, posts){
    if(err){
      req.flash('error', err);
      return res.redirect('/index')
    }
    res.render('tags', {
      title: '标签',
      posts: posts,
      user : req.session.user,
      success : req.flash('success').toString(),
      error : req.flash('error').toString()
    });
  });
});

//获取指定标签下的文章
router.get('/tags/:tag', function(req, res){
  Post.getTag(req.params.tag, function(err, posts){
    if(err){
      req.flash('error', err);
      return res.redirect('/index');
    }
    res.render('tag', {
      title: 'TAG:' + req.params.tag,
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

//文章检索
router.get('/search', function(req, res){
  Post.search(req.query.title, function(err, posts){
    if(err){
      req.flash('error', err);
      return res.redirect('/index');
    }
    res.render('search', {
      title: 'SEARCH:' + req.query.title,
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

//友情链接
router.get('/links', function(req, res){
  res.render('links', {
    title: '友情链接',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

//根据条件获取文章信息
router.get('/u/:name', function(req, res){
  var page = req.query.p ? parseInt(req.query.p) : 1;
  User.get(req.params.name, function(err, user){
    if(!user){
      req.flash('error', '用户不存在！');
      return res.redirect('/index');
    }
    //查询并返回该用户的所有文章
    Post.getTen(user.name, page, function(err, posts, total){
      if(err){
        req.flash('error', err);
        return res.redirect('/index');
      }
      res.render('user', {
        title: user.name,
        posts: posts,
        page: page,
        isFirstPage: (page - 1) == 0,
        isLastPage: ((page - 1) * 10 + posts.length) == total,
        user : req.session.user,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
      });
    });
  });
});

//获取文章
router.get('/p/:_id', function(req, res){
  Post.getOne(req.params._id, function(err, post){
    if(err){
      req.flash('error', err);
      return res.redirect('/index');
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

//获取原文链接
router.get('/u/:name/:day/:title', function(req, res){
  Post.getReprint(req.params.name, req.params.day, req.params.title, function(err, post){
    if(err){
      req.flash('error', err);
      return res.redirect("/index");
    }
    //判断返回的post
    if(post == null){
      req.flash('error', "内容为空");
      return res.redirect('/index');
    }
    res.render('article', {
      title : post.title,
      post : post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

//转载
router.get('/reprint/:_id', checkLogin);
router.get('/reprint/:_id', function (req, res) {
  Post.edit(req.params._id, function (err, post) {
    if (err) {
      req.flash('error', err);
      return res.redirect('back');
    }
    var currentUser = req.session.user,
        reprint_from = {name: post.name, day: post.time.day, title: post.title},
        reprint_to = {name: currentUser.name, head: currentUser.head};
    Post.reprint(reprint_from, reprint_to, function (err, post) {
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      req.flash('success', '转载成功!');
      var url = encodeURI('/p/:' + post._id );
      //跳转到转载后的文章页面
      res.redirect(url);
    });
  });
});

//留言,以前是根据文章的作者，文章的创建日期，文章的标题来留言
//现在根据文章的id留言
//router.post('/u/:name/:day/:title', function(req, res){
router.post('/p/:_id', function(req, res){
  var date = new Date(),
      time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
              date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
  //留言属性
  //var md5 = crypto.createHash('md5'),
      //email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex'),
   var  email_MD5 = md5(req.body.email.toLowerCase()),
        head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
  var comment = {
    name: req.body.name,
    head: head,
    email: req.body.email,
    website: req.body.website,
    time: time,
    content: req.body.content
  };
  //文档
 // var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
  // new object
  var newComment = new Comment(req.params._id, comment);
  console.log(newComment);//log test
  newComment.save(function (err) {
    if (err) {
      console.log("-----------异常状态为：" + err + "---------");
      req.flash('error', err);
      return res.redirect('back');
    }
    req.flash('success', '留言成功!');
    res.redirect('back');
  });
});

//编辑
router.get('/edit/:_id', checkLogin);
router.get('/edit/:_id', function(req, res){
  Post.edit(req.params._id, function(err, post){
    if(err){
      req.flash('error', err);
      return res.redirect('back');
    }
    res.render('edit', {
      title: '编辑',
      post: post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

//update
router.post('/edit/:_id', checkLogin);
router.post('/edit/:_id', function(req, res){
  Post.update(req.params._id, req.body.post, function(err){
    var url = encodeURI('/p/' +  req.params._id);
    if(err){
      req.flash('error', err);
      return res.redirect(url);
    }
    req.flash('success', '修改成功！');
    res.redirect(url);//返回修改当前页
  });
});

//delete
router.get('/remove/:name/:day/:title', checkLogin);
router.get('/remove/:name/:day/:title', function(req, res){
  Post.remove(req.params.name, req.params.day, req.params.title, function(err){
    if(err){
      req.flash('error', err);
      return res.redirect('back');
    }
    req.flash('success', '删除成功！');
    res.redirect('/index');
  });
});

/* 404 */
router.use(function (req, res) {
  res.render("404");
});

//权限
function checkLogin(req, res, next){
  if(!req.session.user){
    req.flash('error', '当前未登录！');
    return res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next){
  if(req.session.user){
    req.flash('error', '已登录');
    return res.redirect('/index');//返回之前的页面
  }
  next();
}

module.exports = router;
