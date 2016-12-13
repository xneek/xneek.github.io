
	var Content = document.getElementById('content');
function isLocalStorageAvailable() { try { return 'localStorage' in window && window['localStorage'] !== null; } catch (e) { return false;}}
if(isLocalStorageAvailable()){
    ls = {
        set: function(key,value){ localStorage.setItem(key, value)},
        get: function(key){ return localStorage.getItem(key)},
        unset: function(key){ localStorage.removeItem(key)},
        clear: function(){ localStorage.clear()},
        empty: function(key){return !(localStorage.getItem(key))}
    }
    window.ls = ls;
} else {
    alert("You need in modern browser");
}

Element.prototype.empty = function(){ this.innerHTML = null; /*while (this.firstChild) {this.removeChild(this.firstChild);}*/ return this;}

Element.prototype.show =  function(){  this.style.display = ''; return this;}
Element.prototype.hide =  function(){  this.style.display = 'none'; return this;}

Element.prototype.remove =  function(){ return this.parentNode.removeChild(this);}
Element.prototype.animate = function(className, callback){ // dep. Animate.css
    var it = this;
    if( typeof it.onanimationend != 'undefined') it.removeEventListener('animationend');
    it.addEventListener("animationend", function(){
        if( typeof callback === 'function' ){ callback.call(it) }
        it.classList.remove('animated');
        it.classList.remove(className);
        if( typeof it.onanimationend != 'undefined') it.removeEventListener('animationend');
    });
    this.classList.add('animated');
    this.classList.add(className);
    return this;
}
	window.addEventListener('load', function() {
		
		document.addEventListener('visibilitychange', function() {
		  if(document.hidden) {
			console.log('save')
		  }
		});

	});

	window.addEventListener('hashchange', function(){});
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
		},
		msg: function(txt, btns){
			let cont = document.getElementById('notify_container');
			if(!cont){ cont = crEl('div',{id:'notify_container'}); document.body.appendChild(cont);}
			let msg = crEl('div',{c:'notify'}, txt);
			let timer = null;
			cont.appendChild(msg);
			
			let hammerHandler = new Hammer(msg, {prevent_default: false});
				hammerHandler.on('pan', function(e) {
					let deltaX = e.deltaX;
					let activationDistance = 80;
					if (!msg.classList.contains('panning')){
						msg.classList.add('panning');
					}
					var opacityPercent = 1-Math.abs(deltaX / activationDistance);
					if (opacityPercent < 0)  opacityPercent = 0;
					msg.style.opacity = opacityPercent;
				});

				hammerHandler.on('panend', function(e) {
				  let deltaX = e.deltaX;
				  let activationDistance = 80;
				  if (Math.abs(deltaX) > activationDistance) {
					cont.removeChild(msg);
				  } else {
					msg.classList.remove('panning');
					msg.style.opacity = 1;
				  }
				});
			
			
			//msg.animate('slideInUp',()=>{
				// timer = setTimeout(()=>{
					// msg.animate('fadeOut',()=>{
						// cont.removeChild(msg);
						// console.info('msg removed');
					// });
				// },3000)			
			// 
		//});
		}
	};		


	Content.innerHTML = '';
	//http://www.achex.ca/dev/
	Content.appendChild(crEl('form', {s:'padding:24px; background:#f8f8f8', e:{submit: function(event){
		event.preventDefault();
		var l = document.getElementById("login");
		var r = document.getElementById("room");
				console.log({l:l.value, r:r.value})
				window.ws = new WebSocket('ws://achex.ca:4010');
			
				window.ws.onmessage = function(evt){
					if(evt && evt.data){
						data = JSON.parse(evt.data);
						//console.info(data);
						
						if(data && data.SID && data.SID>0){
							console.info("SID", data.SID)
						}
						if(data && data.auth && data.auth=='ok'){
							console.info("Auth success")
						}						
					}
				}; 
				
				window.ws.onerror = function(error) {
					console.log("WS:" + error)
				
				};
				
				window.ws.onopen = function() {
					console.log("WS open");
					window.ws.send( JSON.stringify({setID:l.value, passwd:l.value}));
				};
				
				
						
		return false;
	}}},

		crEl('div',{c:'form-group'},
			crEl('label','Логин'),
			crEl('input',{placeholder:'Введите логин (латинские буквы и цифры)', id:'login', pattern:'[A-Za-z0-9]{3,}', required:true, autofocus:true})
		),
		crEl('div',{c:'form-group'},
			crEl('label','Идентификатор игры'),
			crEl('input',{type:'tel',placeholder:'Введите идентификатор игры', id:'room', pattern:'[0-9]{3,}', required:true})
		),
		crEl('div',{c:'form-group'},
			crEl('button',{type:'submit', c:'btn btn-primary'},'Подключиться')
		)
	)); 
	
	Content.appendChild(crEl('button',{e:{click: function(){app.msg(new Date().toLocaleString())}}},'test'))
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
		
