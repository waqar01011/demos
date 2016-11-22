function LoaderDisplay(){

	var _self = this;
	var domElement = $('.loader');
	var loadingElements = [];
	var loadingMessages = [];
	var isComplete = false;
	var intervalId;

	this.addLoader = function(el, message){
		loadingElements.push(el);
		loadingMessages.push(message);
	}

	this.start = function(){
		updateList();
		intervalId = setInterval(_self.checkProgress, 500);
	}

	this.checkProgress = function(){
		updateList();
		if(isComplete == true){
			clearInterval(intervalId);
			onComplete();
		}
	}

	var updateList = function() {
		var loaded = true;
		var list = '<h2>LOADING</h2><ul>';
		for (var i = 0; i < loadingElements.length; i++){
			var el = loadingElements[i];
			if (!el.loaded){
				loaded = false;
				list += '<li>' + loadingMessages[i] + " [ ]" + '</li>' ;
			}else{
				list += '<li>' + loadingMessages[i] + " [x]" + '</li>' ;
			}
		}
		list += '</ul>';

		if (loaded){
			list += '<a href="#" onclick="return false;" id="startButton" class="active">START</a>';
		}else{
			list += '<a href="#" onclick="return false;" class="inactive">START</a>';	
		}

		domElement.html(list);

		isComplete = loaded;
	}

	var onComplete = function(){
		domElement.trigger('complete');
	}

	this.animateOut = function(){
		domElement.hide();
	}



}