var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// 分类的表结构
module.exports =  new Schema({
    // 关联字段
    category:{
        type:mongoose.Schema.Types.ObjectId,
        // 引用，另外一张表的关联字段
        ref:'Category'
    },
    title:String,
    description:{
        type:String,
        default:''
    },
    content:{
        type:String,
        default:''
    }
});
