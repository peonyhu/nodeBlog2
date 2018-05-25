var express = require('express');
var router = express.Router();
var User = require("../models/User");

var responseData;
router.use(function(req,res,next){
    responseData = {
        code:0,
        message:''
    }
    next();
})

router.post('/user/register',function(req,res,next){
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;
    // 用户是否为空
    if(username == ''){
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }
    if(password == ''){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }
    if(password != repassword){
        responseData.code = 3;
        responseData.message = '两次输入的密码不一致';
        res.json(responseData);
        return;
    }
    // 判断数据库中是否有用户名
    User.findOne({
        username:username
    }).then((userInfo)=>{
        if(userInfo){
            responseData.code = 4;
            responseData.message = '用户名已经注册';
            res.json(responseData);
            return;
        }else{
            var user = new User({
                username:username,
                password:password
            });
            return user.save();
        }
    }).then((newUserInfo) => [ 
        responseData.message = '注册成功',
        res.json(responseData)
    ]);
});

router.post('/user/login',function(req,res,next){
    var username = req.body.username;
    var password  = req.body.password;
    if(username == '' || password == ''){
        responseData.code = 1;
        responseData.message = '用户名或密码不能为空';
        res.json(responseData);
        return;
    }
    User.find({
        username:username,
        password:password
    }).then((userInfo)=>{
        if(!userInfo[0]){
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json(responseData);
            return;
        }
        responseData.message = '登录成功';
        responseData.userInfo = {
            _id:userInfo[0]._id,
            username:userInfo[0].username
        };
        req.cookies.set('userInfo',JSON.stringify({
            _id:userInfo[0]._id,
            username:userInfo[0].username
        }));
        res.json(responseData);
    })
})
// 退出
router.get('/user/logout',function(req,res,next){
    req.cookies.set('userInfo',null);
    res.json(responseData);
})
module.exports = router;