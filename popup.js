

function PopUp()
{

	// generate a random id
	var _randomId = (Math.random()*10).toString().replace('.', '');
	var _popupId = 'context-search-popup-' + _randomId;

	var _styleNode = document.createElement('style');

	_styleNode.id = 'context-search-style-' + _randomId;
	_styleNode.type = "text/css";

	document.getElementsByTagName('head')[0].appendChild(_styleNode);


	var _popupNode = document.createElement('ul');
	_popupNode.innerHTML = '<li></li>';
	_popupNode.id = _popupId;
	_popupNode.style.position = 'absolute';
	_popupNode.style.display = 'none';
	_popupNode.style.zIndex = 9999999;

	document.getElementsByTagName('body')[0].appendChild(_popupNode);


	var _popupButton = 1;

	var _downEvent = false;
	var _upEvent = false;
	var _that = this;
	var _active = false;
	var _lastSelection = '';
	var _movedWhilePressed = false;
	var _isPressed = false;


	this.show = function (x, y){

		_popupNode.style.display = 'block';
		_popupNode.style.visibility = 'hidden';

		if (x - window.pageXOffset + _popupNode.offsetWidth > window.innerWidth - 20)
			x -= _popupNode.offsetWidth - 14;
		if (y - window.pageYOffset + _popupNode.offsetHeight > window.innerHeight - 20)
			y -= _popupNode.offsetHeight + 14;

		_popupNode.style.top = y + 'px';
		_popupNode.style.left = x + 'px';

		_popupNode.style.visibility = 'visible';

		_active = true;


	}

	this.hide = function (){
		_popupNode.style.display = 'none';
		_active = false;
	}

	this.setCSSText = function (css){

		while (_styleNode.hasChildNodes()) {
			_styleNode.removeChild(_styleNode.lastChild);
		}

		css = css.replace(/#popup/g, '#' + _popupId);

		var style = document.createTextNode(css);
		_styleNode.appendChild(style);

	}

	this.addCSSText = function (css){

		css = css.replace(/#popup/g, '#' + _popupId);
		var style = document.createTextNode(css);
		_styleNode.appendChild(style);

	}

	this.addSearchEngine = function(engine){

		var li = document.createElement('li');
		var a = document.createElement('a');

		a.innerHTML = '<img src="'+_getIconUrl(engine)+'" />' +engine.name;

		a.search_url = engine.url;
		a.href = '#';

		li.appendChild(a);

		a.onmouseover = function(e){
			this.href = this.search_url.replace('%s', _lastSelection);
		};
	
		_popupNode.appendChild(li);

	}

	this.bindEvents = function(){

		document.addEventListener('mousedown', function(e){

			if(_active)
				_that.hide();

	
			if(e.button == 0)
				_isPressed = true;

			if(e.button == 0 && !_movedWhilePressed){
				_downEvent = e;
				return;
			}


			_movedWhilePressed = false;

			if(!_hasSelection() || e.button != _popupButton)
				return;
		
			y1 = Math.min(_downEvent.pageY,_upEvent.pageY) - 10;
			y2 = Math.max(_downEvent.pageY,_upEvent.pageY) + 10;


			if (e.pageY >= y1 && e.pageY <= y2){

				_lastSelection = _getSelection();
				_setTitle(_lastSelection);
				_that.show(e.pageX, e.pageY);
				e.stopPropagation();
			}


		},false);


		document.addEventListener('mouseup', function(e){
			if (e.button == 0){
				_upEvent = e;
				_isPressed = false;
			}
		},false);

		document.addEventListener('mousemove', function(e){
			if (_isPressed){
				_movedWhilePressed = true;
			}
		},false);

		_popupNode.addEventListener('mousedown', function(e){
			e.stopPropagation();
		},false);



	}

	this.load = function(){
		chrome.extension.sendRequest({}, function(response){
			_that.setCSSText(response.style);
			_popupButton = response.button;
			for (i in response.searchEngines){
				var en = response.searchEngines[i];
				_that.addSearchEngine(en);
			}
		});
	}



	this.getCSS = function(){

		var regexp = new RegExp('#' + _popupId, 'g');
		return _styleNode.innerHTML.replace(regexp, '#popup');;
	}

	this.getForPreview = function(){

		_setTitle('Lorem ipsum dolor sit amet, consectetur');
		_popupNode.style.position = 'static';
		_popupNode.style.display = 'block';
		return _popupNode;

	}

	function _setTitle(title){
		_popupNode.children[0].innerHTML = title;
	}

	function _getSelection(){
		return window.getSelection().toString();
	}

	function _hasSelection(){
		var sel = _getSelection();

		if (sel.length == 0)
			return false;

		return sel.indexOf("\n") == -1;
	}

	function _getIconUrl(engine){
		return PopUp.getIconUrl(engine);

	}

}

PopUp.getIconUrl = function(engine) {
	if(engine.icon_url != undefined)
		return engine.icon_url;
	url = engine.url.replace('http://', '', 'https://', '').split('/')[0];
	return 'http://www.google.com/s2/favicons?domain=' + url;
}

