class Dice {
  
  constructor (){
    this.cube = crEl('div', {c: 'cube'},
        crEl('div', {c: 'side front'},
          crEl('div', {c: 'point pxcenter pycenter one red'})
        ),
        crEl('div', {c: 'side top'}, 
          crEl('div', {c: 'point ptop pleft'}),
          crEl('div', {c: 'point ptop pright'}),
          crEl('div', {c: 'point pbottom pleft'}),
          crEl('div', {c: 'point pbottom pright'})
        ),
        crEl('div', {c: 'side left'}, 
          crEl('div', {c: 'point ptop pright'}),
          crEl('div', {c: 'point pbottom pleft'})
        ),
        crEl('div', {c: 'side right'}, 
          crEl('div', {c: 'point ptop pleft'}),
          crEl('div', {c: 'point ptop pright'}),
          crEl('div', {c: 'point pbottom pleft'}),
          crEl('div', {c: 'point pbottom pright'}),
          crEl('div', {c: 'point pxcenter pycenter'})
        ),
        crEl('div', {c: 'side bottom'}, 
          crEl('div', {c: 'red point ptop pright'}),
          crEl('div', {c: 'red point pbottom pleft'}),
          crEl('div', {c: 'red point pxcenter pycenter'})
        ),
        crEl('div', {c: 'side back'}, 
          crEl('div', {c: 'point ptop pleft'}),
          crEl('div', {c: 'point ptop pright'}),
          crEl('div', {c: 'point pycenter pleft'}),
          crEl('div', {c: 'point pycenter pright'}),
          crEl('div', {c: 'point pbottom pleft'}),
          crEl('div', {c: 'point pbottom pright'})
        )
      );
    this._el = crEl('div', {c: 'dice'},
      this.cube
    ); // this._el

    document.body.appendChild(this._el)
  }
  drop (callback, time = 3){
      let result = Math.round(Math.random()*5 + 1), angle = {};
      this.n = this.n?0:5;
      this.cube.removeAttribute('style');
    let n = this.n;
      angle = {x:360*n,y:360*n}
      switch (result){
            case 1:
              break;
            case 2:
              angle.y = 360*n + 90;
              break;
            case 3:
              angle.x = 360*n + 90;
              break;
            case 4:
              angle.x = 360*n - 90;
              break;
            case 5:
              angle.y = 360*n - 90;
              break;
            case 6:
              angle.x = 360*n + 180;
              break;
          }
    this.cube.setAttribute('style',
      '-webkit-transform:translateZ(-100px) rotateX(' + angle.x + 'deg) rotateY(' + angle.y + 'deg); -webkit-transition: '+ time +'s;'
    );
	if(typeof(callback)==='function'){
		setTimeout(function(){callback(result)}, time*1000)
	}
   
  } 
  
}