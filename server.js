//includes
var sys = require('sys');
var http = require('http');
var message = require('./message');
var fs = require('fs');
var qs = require('querystring');
var rss = require('./node-rss');

// consts
var indexfile = "/index.html";

//debug code
message.addmsg("Hello World", "SYS");
//message.lastmod();
var msgs = message.getmsg();
//sys.log(JSON.stringify(msgs));

// Handles all the requests here
var routes = {
	'/':function (req,rsp){
		sys.log("  -> sending index file");
		var file = fs.readFileSync("./statics" + indexfile);
		rsp.writeHead(200);
		rsp.write(file);
		rsp.end();
	},
	'/lastupdate':function(req,rsp){
		sys.log("  -> sending last update time");
		var lastmod = message.lastmod().toString();
		rsp.writeHead(200);
		rsp.write(lastmod);
		rsp.end();
	},
	'/pullmsg':function(req,rsp){
		http://localhost:888/
		var msgs = message.getmsg();
		var rspobj = {
			messages:msgs,
			lastmod: message.lastmod().toString()
		};
		rsp.writeHead(200,{"Content-Type": "text/json"});
		rsp.write(JSON.stringify(rspobj));
		rsp.end();
	},
	'/postmsg':function(req,rsp,post){
		message.addmsg(post.mymsg, post.nick);
		rsp.writeHead(200);
		rsp.end();
	},
	'/getlast':function(req,rsp){
		var msgs = message.getlast();
		var rspobj = {
			messages:msgs,
			lastmod: message.lastmod().toString()
		};
		rsp.writeHead(200,{"Content-Type": "text/json"});
		rsp.write(JSON.stringify(rspobj));
		rsp.end();
	},
	'/getnewer':function(req,rsp,post){
		// long poll here
		updateLoop(req,rsp,post.lastmod);
		//sys.log("  -> running update loop");
	}
};

var updateLoop = function(req,rsp,mod){
	var rtn = message.getnewer(mod);
	if(!rtn){
		setTimeout(function(){updateLoop(req,rsp,mod);},1000);
		//sys.log("  -> running update loop again");
	}else{
		sys.log("  -> I got the newer msg, sending...");
		var rspobj = {
			messages:rtn,
			lastmod: message.lastmod().toString()
		};
		rsp.writeHead(200,{"Content-Type": "text/json"});
		rsp.write(JSON.stringify(rspobj));
		rsp.end();
	}
}

var _handle_req = function (req,rsp){
	var body = '';
	sys.log( req.method + " " + req.url);
	req.on('data', function (data) {
		body += data;
		//sys.log(data);
	});
	req.on('end', function () {
		var POST = qs.parse(body);
		if(body != '') sys.log("POST DATA:" + sys.inspect(POST));
		//find route
		if(routes[req.url] != undefined){
			sys.log("  Request found in route -> " + req.url)
			var h_req = routes[req.url];
			h_req(req,rsp,POST);
		}else{
			sys.log("  Request for static file-> " + req.url)
			_send_static(req,rsp);
		}
	});
}

var _send_static = function (req,rsp){
	//search for local file
	try{
		var file = fs.readFileSync("./statics" + req.url);
		sys.log("  sending static file -> " + req.url); 
		rsp.writeHead(200);
		rsp.write(file);
		rsp.end();
	}catch(e){
		sys.log("  Err: File Not Found -> " + req.url);
		rsp.writeHead(404);
		rsp.write("404 File Not Found!\n");
		rsp.end();
	}
	
}

// give me the server
var _server = http.createServer().
    addListener('request', _handle_req)
	.listen(8000);
sys.log('=== Server start on port 8000 ===');


//bot code here
var last_article = '';
var botnick = "蘋果";
function mybot(){
	
	var feed_url = 'http://rss.feedsportal.com/c/33277/fe.ed/tw.nextmedia.com/rss/newcreate/kind/rnews/type/';
	//即時新聞 of apple daily
		
	var response = rss.parseURL(feed_url, function(articles) {
		var al = articles.length - 1;
		if (last_article == ''){
			 //push lastest news
			last_article = articles[0].title;
			message.addmsg("<a href='" + articles[0].link + "'>" + 
							articles[0].title + "</a>" , botnick);
		}else{
			for(i = 0; i < al; i++) {
				if(last_article ==articles[i].title) break;
				message.addmsg("<a href='" + articles[i].link + "'>" + 
							articles[i].title + "</a>" , botnick);
			}
		}
		setTimeout(mybot(),1000*60*5);
	});
}
mybot();
setTimeout(mybot(),1000*60*5); // five minutes
