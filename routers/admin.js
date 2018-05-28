var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');
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
    var limit = 2;
    var pages = 0;
    Category.count().then((count)=>{
        pages = Math.ceil(count/limit);
        page = Math.min(page,pages);
        page = Math.max(page,1);
        var skip = (page-1)*limit;
        // id:1生序
        // id：-1降序
        Category.find().sort({_id:-1}).limit(limit).skip(skip).then((categories)=>{
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
        console.log(newCategory)
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'分类成功',
            url:'/admin/category',
            newCategories: newCategory
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
        console.log(category);
        if(!category){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:'分类信息不存在'
            });
            return Promise.reject();
        }else{
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
            return Category.update({
                _id:id    //条件
            },{
                name:name
            })
        }
    }).then(()=>{
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '修改成功',
            url:"/admin/category"
        })
    })
});
// 分类的删除
router.get('/category/delete',function (req,res,next) {
    var id = req.query.id || '';
    Category.remove({
        _id:id
    }).then(()=>{
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'删除成功',
            url:'/admin/category'
        })
    })
})

// 内容首页
router.get('/content',function(req,res,next){

    var page = Number(req.query.page || 1);
    var limit = 2;
    var pages = 0;
    Content.count().then((count) => {
        pages = Math.ceil(count / limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;
        // id:1生序
        // id：-1降序
        Content.find().sort({ _id: -1 }).limit(limit).skip(skip).populate('category').then((contents) => {
            console.log(contents);
            res.render('admin/content_index', {
                userInfo: req.userInfo,
                contents: contents,
                count: count,
                limit: limit,
                pages: pages,
                page: page
            });
        });
    })
})
// 内容添加
router.get('/content/add', function (req, res, next) {
    Category.find().sort({ _id: -1 }).then((categories)=>{
        res.render('admin/content_add', {
            userInfo: req.userInfo,
            categories: categories
        })
    })
});
// 内容保存
router.post('/content/add',function(req,res,next){
    console.log(req.body);
    if(req.body.category == ''){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:'内容分类不能为空'
        })
        return ;
    }
    if (req.body.title == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        })
        return;
    }
    console.log(req.body.descrition)
    new Content({
        category:req.body.category,
        title:req.body.title,
        content:req.body.content,
        description: req.body.descrition
    }).save().then((rs)=>{
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容保存成功',
            url:'/admin/content'
        })
    })
})
// 内容编辑修改后保存
router.get('/content/edit',function(req,res,next){
    var id = req.query.id || '';
    var categories = [];
    Category.find().sort({ _id: -1 }).then((fs) => {
        categories = fs;
        return Content.findOne({
            _id: id
        }).populate('category');
    }).then((content) => {
        console.log(content);
        console.log(categories);
        if (!content) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '指定内容不存在'
            })
            return Promise.reject();
        } else {
            res.render('admin/content_edit', {
                userInfo: req.userInfo,
                message: '修改成功',
                content: content,
                categories:categories
            })
        }
    })
});
router.post('/content/edit',function(req,res,next){
    var id=req.query.id || '';
    var name  = req.body.name || '';
    if (req.body.category == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        })
        return;
    }
    if (req.body.title == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        })
        return;
    }
    Content.update({
        _id:id
    },{
        category:req.body.category,
        title:req.body.title,
        description:req.body.descrition,
        content:req.body.content
    }).then((category)=>{
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'更新成功',
            url:'/admin/content/edit?id='+id
        })
        console.log(category);
    })
})

// 内容的删除
router.get('/content/delete',function(req,res,next){
    var id = req.query.id || '';
    Content.remove({
        _id:id
    }).then((content)=>{
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:'删除成功',
            url:'/admin/content'
        })
        console.log(content);
    })
})

module.exports = router;