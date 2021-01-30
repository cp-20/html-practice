// Response for Uptime Robot
const http = require("http");
const querystring = require("querystring")

// http.createServer(function(req, res){
//  if (req.method == 'POST'){
//    var data = "";
//    req.on('data', function(chunk){
//      data += chunk;
//    });
//    req.on('end', function(){
//      if(!data){
//         console.log("No post data");
//         res.end();
//         return;
//      }
//      var dataObject = querystring.parse(data);
//     //  console.log("post:" + dataObject.type);
//      if(dataObject.type == "wake"){
//       //  console.log("Woke up in post");
//        res.end();
//        return;
//      }
//      res.end();
//    });
//  }
//  else if (req.method == 'GET'){
//    res.writeHead(200, {'Content-Type': 'text/plain'});
//    res.end('Discord Bot is active now\n');
//  }
// }).listen(3000);

module.exports = {
	sleep: function (waitSec, callbackFunc) {
	  var spanedSec = 0;
	  var waitFunc = function () {
	      spanedSec++;
	      if (spanedSec >= waitSec) {
	          if (callbackFunc) callbackFunc();
	          return;
	      }
	      clearTimeout(id);
	      id = setTimeout(waitFunc, 1000);
	  };
	  var id = setTimeout(waitFunc, 1000);
	},

	getFormatDate: function  (date, format) {
	  format = format.replace(/yyyy/g, date.getFullYear());
	  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
	  format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));
	  format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
	  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
	  format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
	  format = format.replace(/SSS/g, ('00' + date.getMilliseconds()).slice(-3));
	  return format;
	}
};