/**
 * Created by JBH on 2015/4/1.
 */
(function(){
    jQuery(function(){
        jQuery("input[type='button']").on("click", function(){
            var $name = jQuery("#name").val();
            var $password = jQuery("#password").val();
            var $span = jQuery("#result").show().find("span");
            if(jQuery.trim($name) === null || jQuery.trim($name) === ''){
                $span.text("用户名不能为空");
                return false;
            }else if(jQuery.trim($password) === null || jQuery.trim($password) === ''){
                $span.text("密码不能为空");
                return false;
            }else{
                $span.parent("div").hide();
                jQuery("form[name='single']").submit();
            }
        }) ;
    });
})();