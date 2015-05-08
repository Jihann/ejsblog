/**
 * Created by JBH on 2015/5/8.
 */
var log4js = require('log4js');
log4js.configure({
   appenders : [
       {
           type : 'console'
       }, //控制台输出
       {
            type : 'file',
            filename : 'logs/ejsblog.log',
            maxLogSize: 1024,
            backups: 3,
            category: 'normal'
       }
   ],
    replaceConsole: true   //替换console.log
});

//配置
var logger = log4js.getLogger('normal');
logger.setLevel('INFO');

//导出
exports.logger = logger;
exports.use = function(app) {
  app.use(log4js.connectLogger(logger, {level: log4js.levels.INFO, format:':method :url'}));
};