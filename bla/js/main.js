
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




function speak(text, params, callback){
	if(!params){params = {};}
	const speakers = ['jane', 'omazh', 'zahar', 'ermil'];
	const emotions = ['good', 'neutral','evil','mixed' ];	
	const key = '16c83422-27bb-416c-9b62-62778fd9dab8';
	params.format = 'mp3';
	params.lang = 'ru‑RU';

	params.speaker =  params.speaker  || 'jane';
	params.emotion =  params.emotion  || 'neutral';
	params.robot   =  !!params.robot;

	let url =	'https://tts.voicetech.yandex.net/generate?'
				+ 'text=' + text + '&'
				+ 'format=' + params.format + '&'
				+ 'lang=' + params.lang + '&'			
				+ 'speaker=' + params.speaker + '&'			
				+ 'key=' + key + '&'			
				+ 'emotion=' + params.emotion + '&'			
				+ 'robot=' + params.robot + ''	


				
	if(url && url.length){
		if(!document.getElementById('audio')){
			document.body.appendChild(crEl('audio', {id:'audio',s:'display:none', autoplay:true}));
		}
		let au = document.getElementById('audio');
			au.src = url;		
			au.load();
			au.addEventListener('error' , function() {
				app.msg('ошибка загрузки файла'+src);
			}, false);
			au.addEventListener('loadedmetadata', function() {
				
			if(!document.getElementById("pcontrol")){
				Content.appendChild(crEl('button',{c:'btn-floating', id:'pcontrol', s:'position:fixed; right:24px; bottom:24px; border:none'},'❚❚'))
			}
			document.getElementById("pcontrol").onclick = null;
			
			
			au.oncanplay = function () {
						if (au.paused && au.currentTime > 0 && !au.ended) {
							 au.play();
							 document.getElementById("pcontrol").innerHTML = '||';
						}
				
				document.getElementById("pcontrol").onclick = (function(myAudio){
					return function(){ 

						if (myAudio.paused && myAudio.currentTime > 0 && !myAudio.ended) {
							 myAudio.play();
							 document.getElementById("pcontrol").innerHTML = 'II';
						 } else {
							 myAudio.pause();
							 document.getElementById("pcontrol").innerHTML = '▶';
						 }

					}
				})(au)
				
			};

			au.onended = function(){
				document.getElementById("pcontrol").remove()
				if(typeof(callback)==='function'){ 
					callback()
				}
			}
			});

	}

};




function declOfNum(number, titles) {  
    cases = [2, 0, 1, 1, 1, 2];  
    return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];  
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
				cource: document.getElementById("cource").checked,
				speaker: document.getElementById("speaker").value,
				emotion: document.getElementById("emotion").value,
				robot: document.getElementById("robot").checked
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
			 
			 location.reload()
			//interface.close();
			return false;
		}}},
			crEl('h4','Основное'),
			crEl('div',{c:'form-group'},
				crEl('label','Как я могу к вам обращаться'),
				crEl('input',{id:'name', placeholder:'Игнатий Спартакович', required:true})
			),
			
			crEl('div',{c:'form-group'},
				
				crEl('div', {s:'display:flex'},
					crEl('div', {s:'margin-right:8px; width:40%'},
						crEl('label','Голос'),
						crEl('select',{id:'speaker'},
							crEl('option',{value:'jane', selected:true},'jane'),
							crEl('option',{value:'alyss'},'alyss'),
							crEl('option',{value:'omazh'},'omazh'),
							crEl('option',{value:'zahar'},'zahar'),
							crEl('option',{value:'ermil'},'ermil')
						)
					),
					crEl('div', {s:'margin-right:8px; width:40%'},
						crEl('label','Интонация '),
						crEl('select',{id:'emotion'},
							crEl('option',{value:'good'},'good'),
							crEl('option',{value:'neutral', selected:true},'neutral'),
							crEl('option',{value:'evil'},'evil'),
							crEl('option',{value:'mixed'},'mixed')
						)
					),
					crEl('div', {s:'margin-left:8px'},
						crEl('label','Робот'),
						crEl('input',{type:'checkbox', id:'robot'})
					)
				)
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
				document.getElementById("speaker").value =  sData.speaker || 'jane';
				document.getElementById("emotion").value =  sData.emotion || 'neutral';
				document.getElementById("robot").checked =  sData.robot || false;
				if(sData.event && sData.event.uts){
					document.getElementById("event_name").value = sData.event.name;
					document.getElementById("event_date").value = new Date(sData.event.uts*1000).toISOString().substr(0,10);
				}
			}
			
			
			document.getElementById("speaker").onchange = function(){
			
				speak('Привет, ' + document.getElementById("name").value + ', меня зовут ' + document.getElementById("speaker").value+'!', {
					speaker: document.getElementById("speaker").value,
					emotion: document.getElementById("emotion").value,
					robot:document.getElementById("robot").checked
				})
			
			}


			
			document.getElementById("emotion").onchange = function(){
			
				speak('Привет, ' + document.getElementById("name").value + ', меня зовут ' + document.getElementById("speaker").value+'!', {
					speaker: document.getElementById("speaker").value,
					emotion: document.getElementById("emotion").value,
					robot:document.getElementById("robot").checked
				})
			
			}


			
			document.getElementById("robot").onchange = function(){
			
				speak('Привет, ' + document.getElementById("name").value + ', меня зовут ' + document.getElementById("speaker").value+'!', {
					speaker: document.getElementById("speaker").value,
					emotion: document.getElementById("emotion").value,
					robot:document.getElementById("robot").checked
				})
			
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
	
	
	Content.style.padding = '8px 20px'
	
			Content.appendChild(crEl('h1',crEl('a',{e:{click:settings}, s:'float:right'},crEl('img',{src:'img/settings-material.svg'})),'Болталка')); 
		

	
		var sData = JSON.parse(ls.get('data'));
		console.info(sData)
		if(sData){
		
		
			var speakCollection = [];
			var lastSpeakedIndex = 0;
			
			function recursiveSpeak(index, callback){
				if(speakCollection && speakCollection.length && speakCollection[index]){
					app.msg(speakCollection[index]);
					speak(speakCollection[index],{
						speaker: sData.speaker,
						emotion: sData.emotion,
						robot:sData.robot
					}, function(){
						if(speakCollection[index+1]){
							recursiveSpeak(index+1, callback);
						} else {
							callback();
						}
					})
				} else {
					app.msg("Нет данных")
				}
			}
		
		
			function dayHi(){
				d = new Date();
				if(d.getHours()<=22){ return "Добрый вечер";}
				if(d.getHours()<=16){ return "Добрый день";}
				if(d.getHours()<=10){ return "Доброе утро";}
				if(d.getHours()<=5){ return "Доброй ночи";}
				 return "Привет";
			}
		
		
			speakCollection.push(dayHi() + ", " + sData.name + "!!!");
			speakCollection.push("Я смогу рассказать тебе кое што интересное.");


		
		
			if(sData.news){
			//AIzaSyBRUdnVCkdYxsl8AHejnU45nK1XHa1gFIY
			   google.load("feeds", "1");

				function initialize() {
				  var feed = new google.feeds.Feed("https://news.yandex.ru/index.rss");
				  feed.setNumEntries(5);
				  feed.load(function(result) {
				  
					speakCollection.push("Самые популярные новости");
					
					if (!result.error) {
						var list = crEl('ul')
					  for (var i = 0; i < result.feed.entries.length; i++) {
						var entry = result.feed.entries[i];
						
						list.appendChild(crEl('li', crEl('a',{target:'_blank', href:entry.link}, entry.title)))
						speakCollection.push(entry.title);
						
					  }
					  
					  Content.appendChild(crEl('div',
						crEl('h3','Основные новости'),
						list
					  ))
					  
					}
				  });
				}
				google.setOnLoadCallback(initialize);

			}
			
			
			if(sData.cource){
				google.load("feeds", "1");

				function initialize() {
				  var feed = new google.feeds.Feed("https://www.cbr.ru/scripts/RssCurrency.asp");
				  
				  feed.load(function(result) {
					if (!result.error) {
						speakCollection.push("Курсы валют");
						var list = crEl('ul');
						var a = result.feed.entries[0].content.split('<br>')
						x = a.map((av)=>{ return av.split(' - '); })
						x.forEach((v)=>{
							
							if(v[0].indexOf('Евро')>=0 || v[0].indexOf('Доллар США')>=0){
								list.appendChild(crEl('li', v[0] + ': ', crEl('strong', v[1])))
								
								speakCollection.push(v[0] + " сегодня стоит " +  v[1].substr(0,2) + declOfNum(parseFloat(v[1]).toFixed(2), ['рубль', 'рубля', 'рублей'])    );
								
							}
						
						})
					  	  Content.appendChild(crEl('div',
							crEl('h3','Курсы валют'),
							list
						  ))
					}
				  });
				}
				google.setOnLoadCallback(initialize);
			}
			
			if( sData.event && sData.event.date && ( new Date(sData.event.date)>new Date() ) ){
				let dif = new Date(sData.event.date).getTime()-new Date().getTime();
					dif = dif/(1000*60*60*24)
				Content.appendChild(crEl('div',
					crEl('h3','Событие'),
					crEl('div', sData.event.name + (dif>1?' через ' +   dif.toFixed() +" "+ declOfNum(parseInt(dif), ['день', 'дня', 'дней']):' завтра!')  )
					
					
								
					
				))
				
				speakCollection.push(  sData.event.name + (dif>1?' через ' +   dif.toFixed() +" "+ declOfNum(parseInt(dif), ['день', 'дня', 'дней']):' завтра!')  );
			}
			
			
			
			
			if( sData.weather ){
				$.get("//api.wunderground.com/api/1badcdefdd22f927/hourly/lang:RU/q/53.2272937,44.9574388.json", function(res){
					w = res;
					console.log(w);
					if( w && w.hourly_forecast ){
						data = w.hourly_forecast [0];
					var veter = ((data.wspd.metric/60/60)*1000).toFixed();
					let weatherStr = "Прогноз погоды.  " + " В " + 
						data.FCTTIME.hour_padded + '  '+
						declOfNum(parseInt(data.FCTTIME.hour_padded), ['час', 'часа', 'часов'])+ ". " +
						data.condition + '.' +
						'Температура ' + data.temp.metric+' ' + ', а ощущается как ' + data.feelslike.metric+ " "+
						(declOfNum(Math.abs(+(data.feelslike.metric)), ['градус', 'градуса', 'градусов']) || 'градусов' )+
						'  цельсия.' +
						' скорость ветра  ' + veter + ' '+
						declOfNum(parseInt(veter), ['метр', 'метра', 'метров'])+
						'  в секунду, ' + "";

	speakCollection.push(  weatherStr  );
					
					Content.appendChild(crEl('div',
						crEl('h3','Погода'),
						crEl('div', weatherStr )
					))
	
	
					}
				})
			/* $.getJSON(,function(w){
						

						
							if( w && w.hourly_forecast ){
								
								var slider = crEl('div',{id:'tempusCarousel',c:'carousel carousel-slider center', d:{indicators:true}});
								
								var cData = [], minD=null, maxD=null;
								w.hourly_forecast.forEach(function(hp){
									slider.appendChild(new ColItem(hp));
									//var d = hp.FCTTIME.mday + ' ' + hp.FCTTIME.month_name_abbrev+' ' + hp.FCTTIME.hour_padded + ':' + hp.FCTTIME.min;
									if(!minD || minD>hp.FCTTIME.epoch){minD = hp.FCTTIME.epoch}
									if(!maxD || maxD<hp.FCTTIME.epoch){maxD = hp.FCTTIME.epoch}
									cData.push([new Date(hp.FCTTIME.epoch*1000), +hp.temp.metric, +hp.feelslike.metric])
								});
								
								slider.appendChild(crEl('div',{c:'carousel-item', s:'padding:20px',id:'firstSl'}));
								
								
								Content.appendChild(slider)
								$(slider).carousel({full_width: true});
								//l37 r39*/
			
			
			
			}			
			
			

			recursiveSpeak(0, function(){
				app.msg("Конец");
			})
			
		}

		
		
	}

	
	
	
	
	
	

app.full = function(body,cb){
	this._el = crEl('div',{id:'modal',s:'position:fixed; z-index:99999; top:0; left:0; width:100%; height:100%; background:#fff;'}, body);
	this.close = function(){ document.getElementById("modal").remove() }
	document.body.appendChild(this._el);
	if(typeof cb === 'function'){ cb(this) }
	return this;
}		
	



