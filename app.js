/* 应用程序的启动入口文件 */

// 加载express模块 
var express = require('express');
// 加载模板处理模块
var swig = require('swig');
var mongoose = require('mongoose');
// 加载body-parser，用来处理post提交过来的数据
var bodyParser = require('body-parser');
// 加载cookies模块
var Cookies = require('cookies');
var User = require('./models/User');
// 创建app应用=>nodejs的http.createServer();
var app = express();

app.use('/public',express.static(__dirname+'/public'));

// 配置应用模板
// 定义当前应用所使用的模板引擎
// 第一个参数，模板引擎的名称，同时也是模板文件的后缀，第二个表示用于解析处理模板内容的方法
app.engine('html',swig.renderFile);
// 设置模板文件存放的目录，第一个参数必须是views，第二个参数是目录的路径
app.set('views','./views');
// 注册所使用的模板引擎，第一个参数必须是view engine，第二个参数和app.engine的第一个参数是一致的
app.set('view engine','html');
// 开发过程中，需要取消缓存
swig.setDefaults({cache:false});

app.use(bodyParser.urlencoded({extended:true}))
app.use(function(req,res,next){
    req.cookies = new Cookies(req,res);
    // 解析登录用户的cookie信息
    req.userInfo = {};
    if(req.cookies.get('userInfo')){
        try{
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            // console.log(req.cookies);
            // 获取当前登录用户的类型,是否是管理员
            User.findById(req.userInfo._id).then((userInfo)=>{
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })
        }catch(e){
            next();
        }
    }else{
        next();
    }
})

// 根据不同的功能划分模块
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));

mongoose.connect('mongodb://localhost:27018/blog2',function(err){
   if(err){
       console.log('数据库连接失败');
   }else{
       console.log('数据库连接成功');
       app.listen(8081);
   }
});
// 监听http请求

// 用户发送http请求-》url-》解析路由-》找到匹配的规则-》执行绑定函数，返回对应内容至用户