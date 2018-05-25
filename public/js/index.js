$(function(){
    var $loginBox = $("#loginBox");
    var $reginBox = $("#registerBox");
    var $userInfo = $("#userInfo");
    $loginBox.find('a.colMint').on('click',function(){
        $loginBox.hide();
        $reginBox.show();
    });
    $reginBox.find('a.colMint').on('click',function(){
        $reginBox.hide();
        $loginBox.show();
    });
    $reginBox.find('button').on('click',function(){
        $.ajax({
            type:'post',
            url:'/api/user/register',
            data:{
                username: $reginBox.find('[name="username"]').val(),
                password:$reginBox.find('[name="password"]').val(),
                repassword:$reginBox.find('[name=repassword]').val()
            },
            dataType:'json',
            success:function(result){
                console.log(result);
                $reginBox.find(".colWarning ").html(result.message);
                if(!result.code){
                    $reginBox.hide();
                    $loginBox.show();
                }
            }
        })
    });
    $loginBox.find('button').on('click',function(){
        $.ajax({
            type:'post',
            url:'/api/user/login',
            data:{
                username: $loginBox.find('[name="username"]').val(),
                password:$loginBox.find('[name="password"]').val(),
            },
            dataType:'json',
            success:function(result){
                // console.log(result);
                $loginBox.find('.colWarning').html(result.message);
                if(!result.code){
                   window.location.reload();
                }
            }
        })
    });
    $("#logout").on('click',function(){
        $.ajax({
            url:'api/user/logout',
            type:'get',
            data:{
            },
            dataType:'json',
            success:function(result){
                if(!result.code){
                    window.location.reload();
                }
            }
        })
    })
})