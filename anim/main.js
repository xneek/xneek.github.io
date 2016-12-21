let Content = document.getElementById('content');
Element.prototype.empty = function(){ this.innerHTML = null; return this;}
Element.prototype.show =  function(){  this.style.display = ''; return this;}
Element.prototype.hide =  function(){  this.style.display = 'none'; return this;}
Element.prototype.append =  function(e){  this.appendChild(e); return this;}
Element.prototype.remove =  function(){ return this.parentNode.removeChild(this);}
Element.prototype.animate = function(values, options={}){ 
	Velocity(this, values, options);
}



function Slider(opts){
	this.el = crEl('div',{c:'sdr',s:'position:relative; overflow-x:hidden;'});
	this.length = 0;
	this.slides = [];
	this.add = function(content){
		let sct = crEl('section',{c:'sdr-item'}, content);
		this.el.appendChild(sct);
		this.slides.push(sct);
		sct.hide();
		this.length++;
	}

	this.set = function(index){
		if(typeof this.active != 'undefined'){
			this.slides[this.active].hide();
			this.slides[index].show();	
		} else {
			this.slides[index].show();
		}		
		this.active =index;
		return this;
	}
	this.next = function(){
		if(this.active>=0 && this.active!=this.length-1){ this.set(this.active+1); } else {this.set(0);}
		return this;
	}
	this.prev = function(){
		if(this.active>=0 && this.active!=0){ this.set(this.active-1); } else {this.set(this.length-1);}
		return this;
	}
	this.dom = function(){
		return this.el;
	}
	
	this.swipeActivate = function(){
		let th = this;
		let elFromLeft, elFromRight;
		this.slides.forEach((slide)=>{
			let hammerHandler = new Hammer(slide, {prevent_default: false});
			hammerHandler.on('pan', function(e) {
				let deltaX = e.deltaX;
				let activationDistance = 80;
				slide.style.transform = 'translateX('+deltaX + 'px)';
				if(deltaX>0){
					elFromLeft = slide.previousSibling || th.slides[th.slides.length-1];
				} else {
					elFromRight = slide.nextSibling || th.slides[0];
				}
				if(elFromLeft){
					elFromLeft.show();
					elFromLeft.style.position = 'absolute';
					elFromLeft.style.width = '100%';
					elFromLeft.style.left = '0';
					elFromLeft.style.top = '0';
					elFromLeft.style.transform = 'translateX('+ (elFromLeft.clientWidth*-1 + deltaX) + 'px)';
					
				}
				if(elFromRight){
					elFromRight.show();
					elFromRight.style.position = 'absolute';
					elFromRight.style.width = '100%';
					elFromRight.style.left = '0';
					elFromRight.style.top = '0';
					elFromRight.style.transform = 'translateX('+ (elFromRight.clientWidth + deltaX) + 'px)';

				}
			});

			hammerHandler.on('panend', function(e) {
			  let deltaX = e.deltaX;
			  let activationDistance = 80;
			  if (Math.abs(deltaX) > activationDistance) {
	
				if(deltaX<0){
					if(elFromRight){
						slide.animate({translateX: [slide.clientWidth*-1,333]})
						elFromRight.animate({translateX: [0,333]},{complete: function(){
							elFromRight.style = '';
							elFromRight.hide();
							th.next()
						}})
					}
					
				} else {
					slide.animate({translateX: [slide.clientWidth,333]})
					console.log(elFromLeft.style.transform)
					elFromLeft.animate({translateX: [1,333]},{ complete: function(){
							elFromLeft.style = '';
							elFromLeft.hide();
							th.prev()
						}})
				}
			  } else {
				if(elFromLeft){
					elFromLeft.style = '';
					elFromLeft.hide();	
				}
				if(elFromRight){
					elFromRight.style = '';
					elFromRight.hide();
				}
				slide.style.transform = 'translate(0)';
			  }
			});
		})
		return this;
	}
}
let sl = new Slider({animate:'fadeIn'});
	sl.add(crEl('div', {s:'background:rgba(255,0,0,.5)'},
		crEl('h3','Первая страница'),
		crEl('p','Текст первой страницы')
	));
	sl.add(crEl('div', {s:'background:rgba(0,255,0,.5)'},
		crEl('h3','Вторая страница'),
		crEl('p','Текст второй страницы')
	));
	sl.add(crEl('div', {s:'background:rgba(0,0,255,.5)'},
		crEl('h3','Третья страница'),
		crEl('p','Текст третьей страницы')
	));
let dom = sl.swipeActivate().set(1).dom();
Content.empty().append(dom);
Content.append(crEl('div',
	crEl('hr'),
	crEl('button',{e:{click:()=>{sl.prev()}}},'prev'),
	crEl('button',{e:{click:()=>{sl.next()}}},'next')
));


