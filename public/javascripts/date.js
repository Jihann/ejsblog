if(typeof window.mf == "undefined"){
	window.mf = {};
}
if(typeof window.mf.date == "undefined"){
	window.mf.date = {};
}

/**
 * 比较两个日期的大小
 * chenweiqiang
 * case：2015-04-10
 */
function compareDate(startdate,enddate){


     var start = startdate.split('-');
     var end = enddate.split('-');

     var sdate = new Date(start[0], start[1], start[2]);
     var edate = new Date(end[0], end[1], end[2]);

      if(sdate.getTime() <= edate.getTime()){
         return true;
     }else{
          return false;
     }
};

/**
 * 时间与日期utils
 * @author jbh
 * @since 2015-04-10
 */
(function($){
	
			/**
			 * 转换时间戳
			 */
			$.unix2Date = function(unixTime, isFull){
			
				var time = new Date(unixTime);
				/* get year */
				var year = time.getFullYear();
				/* get month */
				var month = time.getMonth();
				/* get day */
				var day = time.getDate();
				/* return 结果 */
				var result = "";
				result += year + "-";
				result += ((month + 1) < 10) ? "0" + (month + 1) + "-" : (month + 1) + "-";
				result += (day < 10) ? "0" + day : day;
				
				if(isFull === true){
					
					result += " " + time.getHours() + ":";
					result += time.getMinutes() + ":";
					result += time.getSeconds();
				}
				
				return result;
			}
			
			/**
			 * 取得当前日期
			 * case：2015-04-10
			 */
			$.currentDate = function(){
				
				var date = new Date();
				/* get year */
				var year = date.getFullYear();
				/* get month */
				var month = date.getMonth();
				/* get day */
				var day = date.getDate();
				/* return 结果 */
				var result = "";
				result += year + "-";
				result += ((month + 1) < 10) ? "0" + (month + 1) + "-" : (month + 1) + "-";
				result += (day < 10) ? "0" + day : day;
				
				return result;
			};
			
			
			/**
			 * 取得当前日期往前/后推n天
			 * case：<2014-09-22>2014-09-23<2014-09-26>
			 */
			$.afterOrBeforeDate = function(flag, days){
				
				var date = new Date();
				if(flag === "after"){
					//n天以后计算
					date.setTime(date.getTime() + days*24*60*60*1000);
				}else{
					//n天以前计算
					date.setTime(date.getTime() - days*24*60*60*1000);
				}
				/* get year */
				var year = date.getFullYear();
				/* get month */
				var month = date.getMonth() + 1;
				/* get day */
				var day = date.getDate();
				/* return 结果 */
				var result = "";
				result += year + "-";
				result += (month < 10) ? "0" + month + "-" : month + "-";
				result += (day < 10) ? "0" + day : day;
				
				return result;
			}
			
			/**
			 * 根据类型计算两个时间差
			 * @param 	beginTime 开始时间
			 * @param 	endTime 结束时间
			 * @param 	type 类型
			 * @return 	result 返回计算得到的结果
			 * @author 	JBH
			 * @since	2015-04-10
			 */
			$.betweenDateDiff = function(beginTime, endTime, type){
				
				/* 开始时间 */
				var now_time = new Date(beginTime).getTime();
				/* 结束时间 */
	            var end_time = new Date(endTime).getTime();
	            /* 时间差 */
	            var distance_time = (end_time - now_time) / 1000;
	            /* 声明天，小时，分钟，秒 */
	            var int_day,int_hour,int_minute,int_second;
	            int_day = Math.floor((distance_time / 3600) / 24);
	            int_hour = Math.floor((distance_time / 3600) % 24);
	            int_minute = Math.floor((distance_time / 60) % 60);
	            int_second = Math.floor((distance_time % 60));
	            int_hour = (int_day * 24) + int_hour;//天数+小时
	            int_minute = (int_hour * 60) + int_minute;//小时+分钟
	            /* return result */
	            var result = "";
	            if(1 === type){
	                result = int_minute;
	            }else if(2 === type){
	                result = int_hour;
	            }else{
	                result = int_day;
	            }
	            return result;
			}
			
			/**
			 * 淡定JBH
			 * modify：获取给定日期指定某天后的日期
			 */
			$.getSevenDays = function(currentDate, num){
				
				var today = new Array();
		        var date = new Date(currentDate);
		        //n天以后计算
		        date.setTime(date.getTime() + num * 24 * 60 * 60 * 1000);
		        today['year'] = date.getFullYear();
		        today['week'] = new Array("周日", "周一", "周二", "周三", "周四", "周五", "周六")[date.getDay()];
		        var month = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
		        var day = (date.getDate() < 10) ? "0" + date.getDate() : date.getDate();
		        today['month'] = month;
		        today['day'] = day;
		        return today;
			}
			  
			/**
			 * 验证日期格式
			 */
			$.dateCheck = function(value) {
			    var str = value;
			    var result = str.match(/^(\d{4})(-|\/)(\d{2})\2(\d{2})$/);

			    if (result == null){
			    	return false;
			    }
			    var date = new Date(result[1], result[3] - 1, result[4]);
			    return (date.getFullYear() == result[1] && (date.getMonth() + 1) == result[3] && date.getDate() == result[4]);
			}
})(mf.date);