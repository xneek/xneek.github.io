
	var Content = document.getElementById('content');

	window.addEventListener('load', function() {
		window.addEventListener('hashchange', console.log);
		document.addEventListener('visibilitychange', function() {
		  if(document.hidden) {
			console.log('save')
		  }
		});

	});


	window.onerror = function (msg, url, lineNo, columnNo, error) {
		var string = msg.toLowerCase();
		var substring = "script error";
		if (string.indexOf(substring) > -1){
			alert('Script Error: See Browser Console for Detail');
		} else {
			var message = [
				'Message: ' + msg,
				'URL: ' + url,
				'Line: ' + lineNo,
				'Column: ' + columnNo,
				'Error object: ' + JSON.stringify(error)
			].join(' - ');

			alert(message);
		}

		return false;
	};

	var ls = {
		set:function(key,value){window.localStorage.setItem(key, value)},
		get:function(key){return window.localStorage.getItem(key)},
		unset:function(key){ window.localStorage.removeItem(key)},
		clear:function(){window.localStorage.clear();}
	}


	var app = {

		alert: function(message, alertCallback, title, buttonName){
			if(navigator && typeof(navigator.notification)!=='undefined' && typeof(navigator.notification.alert)!=='undefined'){
				navigator.notification.alert(message, alertCallback, title, buttonName);	
			}
		},
		confirm: function(message, confirmCallback, title, buttonLabels){
			if(navigator && typeof(navigator.notification)!=='undefined' && typeof(navigator.notification.confirm)!=='undefined'){
				navigator.notification.confirm(message, confirmCallback, title, buttonLabels);	
			}	
		},
		prompt: function(message, promptCallback, title, buttonLabels, defaultText){
			if(navigator && typeof(navigator.notification)!=='undefined' && typeof(navigator.notification.prompt)!=='undefined'){
				navigator.notification.prompt(message, promptCallback, title, buttonLabels, defaultText);	
			}	
		},
		beep: function(times){
			if(navigator && typeof(navigator.notification)!=='undefined' && typeof(navigator.notification.beep)!=='undefined'){
				navigator.notification.beep(times);	
			}
		},	
		vibrate: function(milliseconds){
			if(navigator && typeof(navigator.notification)!=='undefined' && typeof(navigator.notification.vibrate)!=='undefined'){
				navigator.notification.vibrate(milliseconds);	
			}
		}
	};		


	Content.innerHTML = '';
	
	content.appendChild(crEl('form', {s:'padding:24px; background:#FFCDD2', e:{submit: function(event){
		event.preventDefault();
		var l = document.getElementById("login");
		var r = document.getElementById("room");
				console.log({l:l.value, r:r.value})
				window.ws = new WebSocket('ws://achex.ca:4010');
			
				window.ws.onmessage = function(evt){
					if(evt && evt.data){
						data = JSON.parse(evt.data);
						console.info(data);
						
						if(data && data.SID && data.SID>0){
							console.info("SID", data.SID)
						}
						
					}
				}; 
				
				window.ws.onerror = function(error) {
					console.log("WS:" + error)
				
				};
				
				window.ws.onopen = function() {
					console.log("WS open")
				};
				
				window.ws.send( JSON.stringify({setID:l.value, passwd:l.value}));
						
		return false;
	}}},
		crEl('div',{c:'form-group'},
			crEl('label','Логин'),
			crEl('input',{placeholder:'Введите логин (латинские буквы и цифры)', id:'login', pattern:'[A-Za-z0-9]{3,}', required:true})
		),
		crEl('div',{c:'form-group'},
			crEl('label','Идентификатор игры'),
			crEl('input',{type:'tel',placeholder:'Введите идентификатор игры', id:'room', pattern:'[0-9]{3,}', required:true})
		),
		crEl('div',{c:'form-group'},
			crEl('button',{type:'submit', c:'btn btn-primary'},'Подключиться')
		)
	)); 
	/*
	content.appendChild(crEl('div',{c:'full-centred'},
		
		crEl('div',
			crEl('button',{c:'btn', e:{click: function(){

				
			}}},'test')
		)
	)); */

app.full = function(body,cb){
		this._el = crEl('div',{id:'modal',s:'position:fixed; z-index:99999; top:0; left:0; width:100%; height:100%; background:#fff;'}, body);
		this.close = function(){ $("#modal").remove() }
		document.body.appendChild(this._el);
		if(typeof cb === 'function'){ cb(this) }
		return this;
}		
		
