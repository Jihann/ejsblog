/**
 * Created by JBH on 2015/4/1.
 * 公共的类库
 */
var crypto = require('crypto');

//导出MD5加密算法
module.exports = function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
};