
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
		beep: function(){
		  new Audio("sound/audio_end.ogg").play();
		  return false;
		},	
		vibrate: function(milliseconds=200){
			if("vibrate" in navigator){ window.navigator.vibrate(milliseconds);	 } else {console.log('вжж')}
		},
		msg: function(txt='', type=0, duration = 3000, playSound = true){
			if(playSound){ new Audio('sound/audio_initiate.ogg').play() }
			let cont = document.getElementById('notify_container');
			if(!cont){ cont = crEl('div',{id:'notify_container'}); document.body.appendChild(cont);}
			let msg = crEl('div',{c:'notify'}, txt);
			msg.close =  function(){
				this.parentNode.removeChild(this);
			}
			msg.addAction =  function(caption, cb, closeOnClick=true){
				let th = this;
				this.appendChild(crEl('button',{c:'action', e:{click: function(){
					if( typeof cb === 'function' ){ cb(this); }
					if( closeOnClick ){ th.close(); }
				}}},caption));
				return this;
			}
			let timer = null;
			cont.appendChild(msg);
	
			if( type>0 || type==='success' ){msg.classList.add('success')}
			if( type<0 || type==='error' ){msg.classList.add('danger')}
			
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
					msg.style.transform = 'translate('+deltaX + 'px)';
				});

				hammerHandler.on('panend', function(e) {
				  let deltaX = e.deltaX;
				  let activationDistance = 80;
				  if (Math.abs(deltaX) > activationDistance) {
					msg.close();
				  } else {
					msg.classList.remove('panning');
					msg.style.opacity = 1;
					msg.style.transform = 'translate(0)';
				  }
				});
			
			
			msg.animate('fadeIn',()=>{
				 timer = setTimeout(()=>{
					 msg.animate('fadeOut',()=>{
						 msg.close();
					 });
			 },duration)			
			 
		 });
		 return msg;
		},
		rndColor: function(){
		//
			return ['#F44336','#E91E63','#9C27B0','#673AB7','#3F51B5','#2196F3','#03A9F4','#00BCD4','#009688','#4CAF50','#8BC34A','#CDDC39','#FFEB3B','#FFC107','#FF9800','#FF5722','#795548'][Math.round(Math.random()*16)]
		}
	};		

		window.ws = new WebSocket('ws://achex.ca:4010');
		window.ws.onmessage = function(evt){
			if(evt && evt.data){
				data = JSON.parse(evt.data);
				console.info(data);
				
				if(data && data.SID && data.SID>0){
					console.info("SID", data.SID);
					app.id = data.SID;
				}
				if(data && data.auth && data.auth=='ok'){
					console.info("Auth success")
				}						
			
				if(data.data){
					console.log("Данные", data)
					if(data.data.move){
						app.msg('Выпало ' + data.data.move.dice);
						app.msg('Поехал с ' + data.data.move.from + ' на ' + data.data.move.to +  ' клетку');
					}
					if(data.data.task){
						app.msg(data.data.task.text,2,60000).addAction('Выполнено', function(){
							window.ws.send( JSON.stringify({toS:app.server, data: {complete:true}}))
						});
						if(data.data.task.music){app.msg('Музыка '+data.data.task.music).addAction('Воспроизвести', function(){
							if(!this.dataset.play){
								window.ws.send( JSON.stringify({toS:app.server, data: {playMusic:true}}))
							} else {
								//pauseMusic
							}
							
						}, false);}
					}						
					
					if(data.data.dropDice){
						app.msg('Бросай кубик').addAction('Бросить', function(){
							window.ws.send( JSON.stringify({toS:app.server, data: {dice:true}}))
						})
					}	

					if(data.data && data.data.move && data.data.move.user){
						let mov = data.data.move;
						
						function Player(id_user, dt){
							return crEl('div',{c:'player', id:'player_id_' + id_user}, crEl('div',{c:'player-name'}, dt.name + '\u00a0' + dt.surname), crEl('div',{c:'fishka', s:'background-color:'+dt.color}, dt.position.toString()));
							/*,
							crEl('div',{c:'player'}, crEl('div',{c:'player-name'},'Даша Кукушкина'), crEl('div',{c:'fishka'},'12')),
							crEl('div',{c:'player'}, crEl('div',{c:'player-name'},'Петя'), crEl('div',{c:'fishka', s:'left:33%; background-color:pink;'},'35'))*/
						}
						
						function moveUser(id_user, to){
							let el = document.getElementById('player_id_' + id_user);
							if(el){
								let fshk = el.querySelector('.fishka');
								if(fshk){
									fshk.style.left = to+'%';
									fshk.innerHTML = to.toString();
								}
							}
						}
						
						let plrs = document.getElementById("players")
						if(!document.getElementById('player_id_' + mov.id_user)){
							plrs.appendChild(new Player(mov.id_user, mov.user));
						}
						moveUser(mov.id_user, mov.to)


						
					}
					
				}
			

			
			}
		}; 

		window.ws.onerror = function(error) {
			console.log("WS:" + error)

		};

		window.ws.onopen = function() {
			console.log("WS open");
			window.ws.send( JSON.stringify({setID: 'login_'+new Date().getTime(), passwd:'login_'+new Date().getTime()}));
			

			/*
				user
				id,
				name,
				surname,
				photo,
				sex 0-Ж; 1-М,
				color
			*/
		};
		
		window.ws.onclose = function(evt){ app.msg("Disconnected");};

	Content.innerHTML = '';
	//http://www.achex.ca/dev/
	let addForm = (crEl('form', {id:'joinToGameForm',s:'padding:24px; background:#f8f8f8'},
		
		location.hash && location.hash.length?crEl('h4',{s:'margin-bottom:30px; opacity:0.5'}, crEl('strong', 'Подключение к игре ',location.hash)):null,
	
		crEl('div',{c:'form-group', id:'idenTyContainer'},
			crEl('label','Идентификатор игры'),
			crEl('input',{type:'tel',placeholder:'Введите идентификатор игры', id:'room', autofocus:true, pattern:'[0-9]{3,}', value:(location.hash && location.hash.length?location.hash.substr(1):''), required:true})
		),
		crEl('div',{c:'form-group'},
			crEl('label','Имя Фамилия'),
			crEl('input',{name: 'name',placeholder:'Введите имя и фамилию через пробел', id:'name', pattern:'[А-Яа-я\-]{3,} [А-Яа-я\-]{3,}', required:true, e:{keydown: function(event){
				if(event.keyCode===13){
					document.getElementById("joinToGameForm").submit();
				}
			}}})
		),
		
		crEl('div',{s:'display:flex'},
			crEl('div',{c:'form-group',s:'width:49%; margin-right:1%'},
				crEl('label',{},'Пол'),
				//crEl('select',{id:'sex',required:true}, crEl('option',{value:'0'},"Ж"), crEl('option',{value:'1'},"М"))
				crEl('label',{for:'sex',c:'gender'}, crEl('input',{id:'sex',type:'checkbox'}), crEl('span'))
			),

			crEl('div',{c:'form-group', s:'width:49%; margin-left:1%'},
				crEl('label','Цвет фишки'),
				crEl('div',{s:'display:flex'},
					crEl('input',{ id:'color', type:'color', value:app.rndColor()}),
					crEl('button',{c:'btn', s:'margin:0; margin-left:8px; height:40px; width:40px; flex:0 40px; padding:8px; min-width:40px', e:{click:function(event){
						event.preventDefault();
						document.getElementById("color").value = app.rndColor();
						return false;
					}}},crEl('img',{src:'img/colors.png'}))
				)
			)
		),
		
		crEl('div',{c:'form-group'},
			crEl('button',{type:'submit', c:'btn btn-primary'},'Подключиться')
		)
	))
	Content.appendChild(addForm); 
	addForm.onsubmit = function(event){
	event.preventDefault();
		
		var l = document.getElementById("name");
		var r = document.getElementById("room");
			app.server = r.value;	
				
			let photo = 'http://vk.com/images/gift/'+(   100+Math.round(  Math.random()*500  )   )+'/256.jpg';
			let nm = document.getElementById("name").value.trim();
			let arr = nm.split(/\s/,2)
			let user = {
				id: app.id,
				name:arr[0] || 'Безымянный',
				surname: arr[1] || 'Безфамильный',
				photo: photo,
				sex: document.getElementById("sex").checked?1:0,
				color: document.getElementById("color").value
			
			};
			
			console.info(user)
			
			window.ws.send( JSON.stringify({toS:app.server, data: {connected:user}}))
			Content.innerHTML = '';

			window.Players = [];
			
			
			Content.appendChild(crEl('div', {c:'full-centred'},
			
					crEl('div', {s:'background:#fff; width:100%; height:100%; margin:0; float:left;'},
						crEl('div', {c:'text-center'},
							crEl('h5','Игра началась'),
							crEl('div',{c:'players', id:'players'})
						)
					)

			))
				
						
		return false;
	
	}
	
	if(location.hash && location.hash.length){
		document.getElementById("idenTyContainer").hide()
		document.getElementById("name").focus();
	}


app.full = function(body,cb){
		this._el = crEl('div',{id:'modal',s:'position:fixed; z-index:99999; top:0; left:0; width:100%; height:100%; background:#fff;'}, body);
		this.close = function(){ $("#modal").remove() }
		document.body.appendChild(this._el);
		if(typeof cb === 'function'){ cb(this) }
		return this;
}		
	


	window.onbeforeunload = function(){ window.ws.send( JSON.stringify({toS:app.server, data: {kill:app.id}}));  ws.close();  } 
	/*
window.onbeforeunload = function() {
    ws.onclose = function () {}; // disable onclose handler first
    ws.close()
	alert('434');
};*/
