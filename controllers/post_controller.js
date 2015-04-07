/**
 * Created by JBH on 2015/3/2.
 * Controller
 */
var mongodb = require('./../config/db'),
    markdown = require('markdown').markdown;

var ObjectID = require('mongodb').ObjectID;
var Post = require('./../models/post');

//获取数据对象模型
module.exports = Post;

/**
 * 发表文章
 * @param callback
 */
Post.prototype.save = function(callback){
    var date = new Date();
    var time = {
        date : date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth() + 1),
        day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    };
    var post = {
        name : this.name,
        head: this.head,
        time : time,
        title : this.title,
        tags: this.tags,
        post : this.post,
        comments: [],
        reprint_info: {},
        pv: 0
    };
    //打开数据库
    mongodb.open(function(err, db){
       if(err){
           return callback(err);
       }
        //读取posts集合
        db.collection('posts', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.insert(post, {
                safe : true
            }, function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);//返回err为null
            });
        });
    });
};

/**
 * 读取文章
 * @param name 文章创建者
 * @param page  分页每十条为一页
 * @param callback
 */
Post.getTen = function (name, page, callback) {
    //打开数据库
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        //读取posts集合
       db.collection('posts', function(err, collection){
          if(err){
              mongodb.close();
              return callback(err);
          }
           var query = {};
           if(name){
               query.name = name;
           }
           //根据query对象查询文章posts
          /* collection.find(query).sort({
               time : -1
           }).toArray(function(err, docs){
                mongodb.close();
               if(err){
                   return callback(err);//失败，返回err
               }
               //解析 markdown 为 html
               docs.forEach(function (doc) {
                   doc.post = markdown.toHTML(doc.post);
               });
               callback(null, docs);//成功以数组的形式返回查询到的结果
           });*/
           collection.count(query, function(err, total){
                collection.find(query, {
                    skip: (page - 1) * 10,
                    limit: 10
                }).sort({
                    time: -1
                }).toArray(function(err, docs){
                    mongodb.close();
                    if(err){
                        return callback(err);//失败，返回err
                    }
                    //解析 markdown 为 html
                    docs.forEach(function (doc) {
                        doc.post = markdown.toHTML(doc.post);
                    });
                    callback(null, docs);//成功以数组的形式返回查询到的结果
                });
           });
       });
    });
};

/**
 * 获取单篇文章
 * @param _id 文章id
 * @param callback
 */
Post.getOne = function(_id, callback){
    //打开数据库
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        //读取posts
        db.collection('posts', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //根据用户名，发表日期以及文章名称进行查询
            collection.findOne({
               "_id": new ObjectID(_id)
            }, function(err, doc){
                if(err){
                    //注意将mongodb.close()仿在if里面，是由于node.js的异步回调机制，
                    //下面还有一个mongodb.close要执行
                    mongodb.close();
                    return callback(err);
                }
                if (doc) {
                    //每访问 1 次，pv 值增加 1
                    //修改器$inc可以对文档的某个值为数字型（只能为满足要求的数字）的键进行增减的操作
                    collection.update({
                        "_id": new ObjectID(_id)
                    }, {
                        $inc: {"pv": 1}
                    }, function (err) {
                        mongodb.close();
                        if (err) {
                            return callback(err);
                        }
                    });
                    //解析 markdown 为 html
                    doc.post = markdown.toHTML(doc.post);
                    doc.comments.forEach(function (comment) {
                        comment.content = markdown.toHTML(comment.content);
                    });
                    callback(null, doc);//返回查询的一篇文章
                }
            });
        });
    });
};

/**
 * 获取转载的文章详情
 * @param name 文章作者
 * @param day 文章发表日期
 * @param title 文章标题
 * @param callback
 */
Post.getReprint = function(name, day, title, callback){
    //打开数据库
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        //读取posts
        db.collection("posts", function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //查询
            collection.findOne({
                "name" : name,
                "time.day" : day,
                "title" : title
            }, function(err, doc){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                //解析 markdown 为 html
                doc.post = markdown.toHTML(doc.post);
                doc.comments.forEach(function (comment) {
                    comment.content = markdown.toHTML(comment.content);
                });
                callback(null, doc);
            })
        });
    });
};

/**
 * 文章编辑
 * @param _id 文章id
 * @param callback
 */
Post.edit = function(_id, callback){
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        //读取posts
        db.collection('posts', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //查询
            collection.findOne({
               "_id":  new ObjectID(_id)
            }, function(err, doc){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null, doc);//返回查询的一篇文章（markdown 格式）
            });
        });
    });
};

/**
 * 文章修改
 * @param _id 文章id
 * @param post 文章内容
 * @param callback
 */
Post.update = function(_id, post, callback){
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        //读取posts
        db.collection('posts', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //更新文章内容
            collection.update({
                "_id": new ObjectID(_id)
            }, {
                $set: {post: post}
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

//删除<已废除该方法>
Post.remove = function(name, day, title, callback){
    console.log("------------remove delete first------------");
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        //读取posts
        db.collection('posts', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //根据条件删除
            collection.remove({
                "name": name,
                "time.day": day,
                "title": title
            }, {
                w: 1
            }, function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

/**
 * 返回所有文章的存档信息
 * @param callback
 */
Post.getArchive = function(callback) {
  //打开数据库
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        //读取posts
        db.collection('posts', function(err, collection) {
           if(err){
               mongodb.close();
               return callback(err);
           }
            //返回name,time, title
            collection.find({
                "name": 1,
                "time": 1,
                "title": 1
            }).sort({
                time: -1
            }).toArray(function(err, docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};

/**
 * 获取文章的标签
 * @param callback
 */
Post.getTags = function(callback){
     //打开数据库
    mongodb.open(function(err, db){
        if(err){
            callback(err);
        }
        //读取posts
        db.collection('posts', function(err, collection){
           if(err){
               mongodb.close();
               return callback(err);
           }
            //读取标签
            collection.distinct('tags', function(err, docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};

/**
 * 获取指定标签下的所有文章信息
 * @param tag 标签
 * @param callback
 */
Post.getTag = function(tag, callback){
    //打开数据库
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        //读取posts
        db.collection('posts', function(err, collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            //查询所有 tags 数组内包含 tag 的文档
            //并返回只含有 name、time、title 组成的数组
            collection.find({
                "tags": tag
            }, {
                "name": 1,
                "time": 1,
                "title": 1
            }).sort({
                time: -1
            }).toArray(function(err, docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};

/**
 * 文章检索
 * @param title 文章标题
 * @param callback
 */
Post.search = function(title, callback){
    //打开数据库
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        //读取posts
        db.collection('posts', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            var pattern = new RegExp(title, "i");
            collection.find({
                "title": pattern
            }, {
                "name": 1,
                "time": 1,
                "title": 1
            }).sort({
                time: -1
            }).toArray(function(err, docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};

/**
 * 转载文章
 * @param reprint_from 文章来源
 * @param reprint_to 文章存档
 * @param callback
 */
Post.reprint = function(reprint_from, reprint_to, callback){
    //打开数据库
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }
        //读取posts
        db.collection('posts', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //找到被转在文章的源文档
            collection.findOne({
                "name": reprint_from.name,
                "time.day": reprint_from.day,
                "title": reprint_from.title
            }, function(err, doc){
                if(err){
                    mongodb.close();
                    return callback(err);
                }
                var date = new Date();
                var time = {
                    date: date,
                    year : date.getFullYear(),
                    month : date.getFullYear() + "-" + (date.getMonth() + 1),
                    day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
                    minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
                    date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
                };
                delete doc._id;//注意要删掉原来的 _id

                doc.name = reprint_to.name;
                doc.head = reprint_to.head;
                doc.time = time;
                doc.title = (doc.title.search(/[转载]/) > -1) ? doc.title : "[转载]" + doc.title;
                doc.comments = [];
                doc.reprint_info = {"reprint_from": reprint_from};
                doc.pv = 0;

                //更新被转载的原文档的 reprint_info 内的 reprint_to
                collection.update({
                    "name": reprint_from.name,
                    "time.day": reprint_from.day,
                    "title": reprint_from.title
                }, {
                    $push: {
                        "reprint_info.reprint_to": {
                            "name": doc.name,
                            "day": time.day,
                            "title": doc.title
                        }}
                }, function (err) {
                    if (err) {
                        mongodb.close();
                        return callback(err);
                    }
                });

                //将转载生成的副本修改后存入数据库，并返回存储后的文档
                collection.insert(doc, {
                    safe: true
                }, function (err, post) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    callback(err, post[0]);
                });
            })
        });
    });
};

/**
 * 删除文章
 * @param name 文章创建者
 * @param day 文章发表日期
 * @param title 文章标题
 * @param callback
 */
Post.remove = function(name, day, title, callback) {
    console.log("------------remove delete second------------");
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //查询要删除的文档
            collection.findOne({
                "name": name,
                "time.day": day,
                "title": title
            }, function (err, doc) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                //如果有 reprint_from，即该文章是转载来的，先保存下来 reprint_from
                var reprint_from = "";
                if (doc.reprint_info.reprint_from) {
                    reprint_from = doc.reprint_info.reprint_from;
                }
                if (reprint_from != "") {
                    //更新原文章所在文档的 reprint_to
                    collection.update({
                        "name": reprint_from.name,
                        "time.day": reprint_from.day,
                        "title": reprint_from.title
                    }, {
                        $pull: {
                            "reprint_info.reprint_to": {
                                "name": name,
                                "day": day,
                                "title": title
                            }}
                    }, function (err) {
                        if (err) {
                            mongodb.close();
                            return callback(err);
                        }
                    });
                }

                //删除转载来的文章所在的文档
                collection.remove({
                    "name": name,
                    "time.day": day,
                    "title": title
                }, {
                    w: 1
                }, function (err) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
            });
        });
    });
};