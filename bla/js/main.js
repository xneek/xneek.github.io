
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




function fetch(address, callback, method ='GET') {
	 var XHR = window.XDomainRequest || window.XMLHttpRequest
	 var xmlhttp = new XHR();

		xmlhttp.withCredentials = true;
		xmlhttp.open(method, address, true);
		xmlhttp.send();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
           if (xmlhttp.status == 200) {
               callback(xmlhttp.responseText);
           }
           else if (xmlhttp.status == 400) {
              console.log('There was an error 400');
           }
           else {
                console.log('something else other than 200 was returned'+xmlhttp.status);
           }
        }
    };


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

		

	Content.innerHTML = '';
	// https://lenta.ru/rss/top7

	
	function settings(){
		let interface = app.full(crEl('div',
		
		crEl('form', {s:'padding:8px 16px', e:{submit: function(event){
			event.preventDefault();
			let obj = {
				name: document.getElementById("name").value.trim(),
				news: document.getElementById("news").checked,
				weather: document.getElementById("weather").checked,
				cource: document.getElementById("cource").checked
			}
			
			let evName = document.getElementById("event_name").value.trim();
			let evDate = document.getElementById("event_date").value.trim();
			if(evName.length>0 && evDate.length){
				ts = Date.parse(evDate);
				obj.event = {
					name:evName,
					date: new Date(ts),
					uts: ts/1000
				}
			}
			
			console.log(obj)
			 ls.set('data',  JSON.stringify(obj) ); 
			//interface.close();
			return false;
		}}},
			crEl('div',{c:'form-group'},
				crEl('label','Как я могу к вам обращаться'),
				crEl('input',{id:'name', placeholder:'Игнатий Спартакович', required:true})
			),
			crEl('div',{c:'form-group'},
				crEl('label','О чём вам рассказывать'),
				crEl('div',{s:'display:flex'},
					crEl('div',{c:'form-group checkbox', s:'margin-right:24px;'},
						crEl('input',{id:'news', type:'checkbox', checked:true}),
						crEl('label',{for: 'news'}, 'Новости')	
					),
					crEl('div',{c:'form-group checkbox', s:'margin-right:24px;'},
						crEl('input',{id:'weather', type:'checkbox', checked:true}),
						crEl('label',{for: 'weather'}, 'Погода')	
					),
					crEl('div',{c:'form-group checkbox', s:'margin-right:0;'},
						crEl('input',{id:'cource', type:'checkbox'}),
						crEl('label',{for: 'cource'}, 'Курсы валют')	
					)
				)
			),
			crEl('div',{c:'form-group'},
				crEl('label','Считать дни до '),
				crEl('div', {s:'display:flex'},
					crEl('input',{id:'event_date', type:'date', s:'margin-right:8px'}),
					crEl('input',{id:'event_name', placeholder:'Событие', s:'margin-left:8px'})
				)
			),
			crEl('div',{c:'form-group', s:'text-align:right'},
				crEl('button',{c:'btn btn-primary', type:'submit', s:'width:100%'},'Сохранить')
			)
			
		)
		), function(){
			
			let sData = JSON.parse( ls.get('data') ) || {};
			if(sData && sData.name){
				document.getElementById("name").value = sData.name;
				document.getElementById("news").checked =  sData.news;
				document.getElementById("weather").checked =  sData.weather;
				document.getElementById("cource").checked =  sData.cource;
				if(sData.event){
					document.getElementById("event_name").value = sData.event.name;
					document.getElementById("event_date").value = new Date(sData.event.uts*1000).toISOString().substr(0,10);
				}
			}
			
			
		})
	}
	
	if(!ls.get('data')){
	
		Content.appendChild(crEl('div',{c:'full-centred'},
			crEl('div',{c:'text-center'},
				'Привет, я буду говорить,',
				 crEl('br'),
				'но меня нужно настроить...',
				crEl('div',{s:'font-size:10em;'},'☺'),
				crEl('button',{c:'btn btn-primary', e: {click: settings}},'Настроить')
			)
		)); 
	} else {
		var sData = JSON.parse(ls.get('data'));
		console.info(sData)
		if(sData){
			if(sData.news){
			//AIzaSyBRUdnVCkdYxsl8AHejnU45nK1XHa1gFIY
   google.load("feeds", "1");

    function initialize() {
      var feed = new google.feeds.Feed("https://news.yandex.ru/index.rss");
	  feed.setNumEntries(5);
      feed.load(function(result) {
        if (!result.error) {
			var list = crEl('ul')
          for (var i = 0; i < result.feed.entries.length; i++) {
            var entry = result.feed.entries[i];
            console.log(entry);
			list.appendChild(crEl('li', crEl('a',{target:'_blank', href:entry.link}, entry.title)))
			
			
          }
		  
		  Content.appendChild(crEl('div',
			crEl('h3','Основные новости'),
			list
		  ))
		  
        }
      });
    }
    google.setOnLoadCallback(initialize);
				


				
	
				
				
			/*
				var parser = new DOMParser();
				var xmlDoc = parser.parseFromString(txt, "text/xml"); // https://lenta.ru/rss/top7
				I think nowadays you can also use things like querySelectorAll to quickly iterate over the document, similar to normal DOM. E.g. something like this would work:

				[].forEach.call(xmlDoc.querySelectorAll('item'), function(item) {
				console.log(item.querySelector('title').textContent);
				});		*/	
			}
		}
		Content.appendChild(crEl('h1',crEl('a',{e:{click:settings}, s:'float:right'},'настройки'),'Заголовок')); 
		

		
		
	}

	
	
	
	
	
	

app.full = function(body,cb){
	this._el = crEl('div',{id:'modal',s:'position:fixed; z-index:99999; top:0; left:0; width:100%; height:100%; background:#fff;'}, body);
	this.close = function(){ document.getElementById("modal").remove() }
	document.body.appendChild(this._el);
	if(typeof cb === 'function'){ cb(this) }
	return this;
}		
	



