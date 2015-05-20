/**
 * Created by JBH on 2015/5/8.
 */
var log4js = require('log4js');
log4js.configure({
   appenders : [
       {
           type : 'console'
       },
       // 定义一个日志记录器
       {
            type : 'file',
            filename : 'weblogs/ejsblog.log',
            maxLogSize: 1024,
            backups: 3,
            category: 'normal'
       }
   ],
    replaceConsole: true
});

//配置
var logger = log4js.getLogger('normal');
logger.setLevel('INFO');

exports.logger = logger;
exports.use = function(app) {
  app.use(log4js.connectLogger(logger, {level: log4js.levels.INFO, format:':method :url'}));
};
