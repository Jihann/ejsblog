/**
 * Created by JBH on 2015/4/17
 * 采用Async异步模块编程
 */
var async = require('async');
var username = "Jihann";
var hobby = "The fall of the year";

//waterfall(tasks, [callback])
async.waterfall([
    function(callback) {
        callback(null, username, hobby);
    },
    function(username, hobby, callback) {
        console.log("-------------- info message start --------------");
        console.log("-------------username: " + username);
        console.log("-------------hobby: " +hobby);
        var userInfo = "hello " + username + ",this is my hobby: " + hobby;
        callback(null, userInfo);
    },
    function(userInfo, callback) {
        console.log("----------------userInfo: " + userInfo);
        var final = "congratulations";
        callback(null, final);
    },
    function(final, callback) {
        var end = final + "\t" + username;
        callback(null, end);
    }
], function(err, end) {
    console.log("-------------end: " + end);
    console.log("-------------- info message end --------------");
});

