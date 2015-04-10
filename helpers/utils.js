/**
 * Created by JBH on 2015/04/10.
 */

var date = new Date();
console.log(date.toDateString());

var str = '2146526.00';

var formatNumber = function(num, precision, separator) {
    var parts;
    // 判断是否为数字
    //isNan判断是否是非法数字
    // isFinite检测谁否是有限数字
    if (!isNaN(parseFloat(num)) && isFinite(num)) {//如果是数字
        num = Number(num);
        // 处理小数点位数
        // toFixed() 方法可把 Number 四舍五入为指定小数位数的数字
        num = (typeof precision !== 'undefined' ? num.toFixed(precision) : num).toString();
        // 分离数字的小数部分和整数部分
        parts = num.split('.');
        // 整数部分加[separator]分隔, 借用一个著名的正则表达式
        parts[0] = parts[0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + (separator || ','));

        return parts.join('.');
    }
    return NaN;
}

var num = 12312312.1234567119;
var float = parseFloat(num);
console.log(float);
console.log(!isNaN(float));
console.log(isFinite(float));

var result = formatNumber(0, 2);
console.log(result);

// test js 闭包特性
(function(){
    function Foo(){
        var i=0;
        return function(){
            console.log(i++);
        }
    }

    var f1=Foo(),
        f2=Foo(),
        f3=f2;
    f1();
    f1();
    f2();
    f3();
})();
