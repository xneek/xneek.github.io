function Speaker(){
	th = this;
	this.voices = [];
	synth = window.speechSynthesis;
	this._getVoices = function(cb){
		th.voices = synth.getVoices();
		if( typeof cb === 'function' )cb.call(this)
	} 
	this._getVoice = function(lang){
		for(i = 0; i < this.voices.length ; i++){
			if(this.voices[i].lang == lang){ return this.voices[i]; }
		}
		return false;
	} 

	this.speak =function(text){
		if(!this.voices.length){ setTimeout(function(){th.speak.apply(th, [text])},1000); return false;}
			var utterThis = new SpeechSynthesisUtterance(text);
				utterThis.pitch = 1;
				utterThis.lang = 'ru-RU';
				utterThis.rate = 1;
				utterThis.voice = th._getVoice('ru-RU');
				
				console.info(utterThis, synth)
				
			synth.speak(utterThis);
			  utterThis.onpause = function(event) {
				var char = event.utterance.text.charAt(event.charIndex);
				console.log('Speech paused at character ' + event.charIndex + ' of "' +
				event.utterance.text + '", which is "' + char + '".');
			  }		
		

	}	
	
	
	if (synth.onvoiceschanged !== undefined) {
	   synth.onvoiceschanged = this._getVoices;
	} else {
		this._getVoices();
	}
}




  
 










var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent
/*
var colors = [ 'aqua' , 'azure' , 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', 'crimson', 'cyan', 'fuchsia', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'indigo', 'ivory', 'khaki', 'lavender', 'lime', 'linen', 'magenta', 'maroon', 'moccasin', 'navy', 'olive', 'orange', 'orchid', 'peru', 'pink', 'plum', 'purple', 'red', 'salmon', 'sienna', 'silver', 'snow', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'white', 'yellow'];
var grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;'
*/
var recognition = new SpeechRecognition();
//var speechRecognitionList = new SpeechGrammarList();
//speechRecognitionList.addFromString(grammar, 1);
//recognition.grammars = speechRecognitionList;
//recognition.continuous = false;
recognition.lang = 'ru-RU';
recognition.interimResults = false;
recognition.maxAlternatives = 1;
res.textContent = 'Нажми на кнопку и говори';
btn.textContent = 'Записать'
btn.onclick = function() {
  recognition.start();
  console.log('Ready to receive a color command.');
  res.textContent = 'Говори...';
  btn1.disabled = true;
}
var s = new Speaker();

btn1.onclick = function() {
  s.speak(res.textContent);
}

btn1.disabled = true;

recognition.onresult = function(event) {
  // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
  // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
  // It has a getter so it can be accessed like an array
  // The [last] returns the SpeechRecognitionResult at the last position.
  // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
  // These also have getters so they can be accessed like arrays.
  // The [0] returns the SpeechRecognitionAlternative at position 0.
  // We then return the transcript property of the SpeechRecognitionAlternative object
btn1.disabled = false;
  var last = event.results.length - 1;
  var color = event.results[last][0].transcript;

  res.textContent = '' + color + '';
  

   
	

  
  
  
  
 // bg.style.backgroundColor = color;
  console.log('Confidence: ' + event.results[0][0].confidence);
}

recognition.onspeechend = function() {
  recognition.stop();
}

recognition.onnomatch = function(event) {
  res.textContent = "I didn't recognise that color.";
}

recognition.onerror = function(event) {
  res.textContent = 'Error occurred in recognition: ' + event.error;
}
