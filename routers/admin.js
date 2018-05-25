var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
router.use(function(req,res,next){
    if(!req.userInfo.isAdmin){
        res.send('对不起，只有管理员才可以进入后台管理');
        return;
    }
    next();
})

// 首页
router.get('/',function(req,res,next){
    res.render('admin/index',{
        userInfo:req.userInfo
    });
});
// 用户管理
router.get('/user',function(req,res,next){
    /* 
    *  limit(Number) 获取限制的条数
    *  skip(2) 忽略数据的条数
    *  每页显示2条
    *  1：1-2 skip:0 -> (当前页-1)*limit
    *  2:3-4  skip:2 -> (当前页-1)*limit
    *  3:5-6  skip:4 -> (当前页-1)*limit
     */
    var page = Number(req.query.page || 1);
    var limit = 1;
    var pages = 0;

    User.count().then((count)=>{
        pages = Math.ceil(count/limit);
        
        page = Math.min(page,pages);
        page = Math.max(page,1);
        var skip = (page-1)*limit;
        User.find().limit(limit).skip(skip).then((users)=>{
            res.render('admin/user_index',{
                userInfo:req.userInfo,
                users:users,
                count:count,
                limit:limit,
                pages:pages,
                page:page  
            });
        });
    })
});
// 分类管理
router.get('/category',function(req,res,next){
    var page = Number(req.query.page || 1);
    var limit = 1;
    var pages = 0;
    Category.count().then((count)=>{
        pages = Math.ceil(count/limit);
        page = Math.min(page,pages);
        page = Math.max(page,1);
        var skip = (page-1)*limit;
        Category.find().limit(limit).skip(skip).then((categories)=>{
            res.render('admin/category_index',{
                userInfo:req.userInfo,
                categories:categories,
                count:count,
                limit:limit,
                pages:pages,
                page:page  
            });
        });
    })
})
// 分类添加
router.get('/category/add',function(req,res,next){
    res.render('admin/category_add',{
        userInfo:req.userInfo
    })
});
// 分类的保存
router.post('/category/add',function(req,res,next){
    var name = req.body.name || '';
    if(name == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'名称不能为空'
        })
        return;
    }
    // 数据库中是否已经存在同名分类名称
    Category.findOne({
        name:name
    }).then((rs)=>{
        console.log(rs);
        if(rs){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类已经存在'
            })
            return Promise.reject();
        }else{
            return new Category({
                name:name
            }).save();
        }
    }).then((newCategory) => {
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'分类成功',
            url:'/admin/category',
            newCategories:newCategories
        })
    })
});

// 分类修改
router.get('/category/edit',function(req,res,next){
    var id = req.query.id || '';
    Category.findOne({
        _id:id
    }).then((category)=>{
        console.log(category);
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            });
            return Promise.reject();
        }else{
            res.render('admin/category_edit',{
                userInfo:req.userInfo,
                category:category
            })
        }
    })
});
// 分类修改后保存
router.post('/category/edit',function(req,res,next){
    var id = req.query.id;
    // 获取post提交过来的名称
    var name = req.body.name || '';
    Category.findOne({
        _id:id
    }).then((category)=>{
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            });
            return Promise.reject();
        }else{
            // console.log(category);
            // Category.find().then((categories)=>{
            //     console.log(categories)
            // })
            // 没有修改直接提交
            if(category.name == name){
                res.render('admin/error',{
                    userInfo:req.userInfo,
                    message:'修改成功',
                    url:'/admin/category'
                });
                return Promise.reject();
            }else{
                // 要修改的数据库名称是否已经存在
                return Category.findOne({
                    _id:{$ne:id},
                    name:name
                })
                // return new Category({
                //     _id:req.query.id,
                //     name:req.body.name
                // }).save();
                
            }
        }
    }).then((sameCategory)=>{
        if(sameCategory){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'数据库中已经存在同名分类'
            })
            return Promise.reject();
        }else{
            Category.update({
                name:req.body.name
            })
            // res.render('admin/category_index',{
            //     userInfo:req.userInfo,
            //     message:'修改成功'
            // })
        }
        console.log(sameCategory);
    })
})

module.exports = router;