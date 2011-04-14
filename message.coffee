message = ()->
	messages = {};
	this.addmsg = (message,nickname)->
		now = new Date();
		this.messages.push({time:now,msg:message,nick:nickname});
		sys.log "push message:[" + now + "]<" + nickname + ">: " + message 
	this.lastmod = ()->
		return false if messages.length() < 1
		count = messages.length()
		return messages[count].time
		