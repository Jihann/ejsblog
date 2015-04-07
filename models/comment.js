/**
 * Created by JBH on 2015/3/2.
 */
var mongodb = require('./../config/db');

//差点忘记引入这个模块，导致下面的一直报错(ReferenceError: ObjectID is not defined)
var ObjectID = require('mongodb').ObjectID;

//function Comment(name, day, title, comment){
   // this.name = name;
    //this.day = day;
    //this.title = title;
    //this.comment = comment;
//}

//new add
function Comment(_id, comment){
    this._id = _id;//文章标识id
    this.comment = comment;//留言内容
}

module.exports = Comment;

/**
 * 保存文章对应的留言
 * @param callback
 */
Comment.prototype.save = function(callback){
    //var name = this.name,
       // day = this.day,
        //title = this.title,
        //comment = this.comment;
    var _id = this._id,
        comment = this.comment;
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
            console.log("-----------" + _id +"------update-------------" + comment);//log test
            //追加留言
            collection.update({
                "_id": new ObjectID(_id)
            }, {
                $push: {comments: comment}
            }, function(err){
                console.log("-------------end-----------");
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};
