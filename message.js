var sys = require("sys");
var message = exports;
var messages = [];

message.addmsg = function(message, nickname) {
	var now = (new Date()).getTime();
	messages.push({
		time: now,
		msg: message.replace(/script/i,'').replace("<","&lt;").replace(">","&gt;") ,
		nick: nickname
	});
	return sys.log("push message:[" + now + "]<" + nickname + ">: " + message.replace(/script/i,'').replace("<","&lt;").replace(">","&gt;"));
};
message.lastmod = function() {
	var count = messages.length;
	if ( count < 1) {
		return false;
	}else{
		var msg = messages[count-1];
		//sys.log("last message@ " + msg.time);
		return msg.time;
	}
};
message.getmsg = function(){
	return messages;
}
message.getlast = function(){
	var count = messages.length;
	if ( count < 1) {
		return false;
	}else{
		var msg = messages[count-1];
		return msg;
	}
}
message.getnewer = function (oldtime){
	// known issue: if msg.time are same as oldtime > 1 
	// it will lost these msgs
	
	var newmsgs = [];
	//chk if oldtime = last (issue here)
	var count = messages.length;
	if ( count < 1) {
		return false;
	}
	var msg = messages[count-1];
	if(msg.time <= oldtime){
		return false;
	}
	var i = count - 1;
	while(i >= 0){ // find msg in reverse for speed
		var tmpmsg = messages[i];
		if( tmpmsg.time > oldtime ){
			//newmsgs.push(tmpmsg);  
			newmsgs.unshift(tmpmsg); // fix order bug
		}else{
			break;
		}
		i--;
	}
	if(newmsgs.length < 1){
		return false;
	}else{
		return newmsgs;
	}	
	
}

