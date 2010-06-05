

function PopUp()
{

	// generate a random id
	var _randomId = (Math.random()*10).toString().replace('.', '');
	var _popupId = 'context-search-popup-' + _randomId;

	var _styleNode = $('<style type="text/css"></style>');

	_styleNode.attr('id', 'context-search-style-' + _randomId);

	$('head').first().append(_styleNode);


	var _popupNode = $('<ul><li></li></ul>');

	_popupNode.attr('id', _popupId);
	_popupNode.css({
		'position': 'absolute',
		'display' :  'none',
		'zIndex' :  9999999,
	});

	$('body').first().append(_popupNode);


	var _popupButton = 1;

	var _downEvent = false;
	var _upEvent = false;
	var _that = this;
	var _active = false;
	var _lastSelection = '';
	var _movedWhilePressed = false;
	var _isPressed = false;
	var _options;
	var _doubleClick = false;
	var _doubleClickTime = 0;

	this.show = function (x, y){

		_popupNode.css({'display': 'block', 'visibility': 'hidden'});

		if (x - window.pageXOffset + _popupNode.outerWidth() > window.innerWidth - 20)
			x -= _popupNode.outerWidth() - 14;
		if (y - window.pageYOffset + _popupNode.outerHeight() > window.innerHeight - 20)
			y -= _popupNode.outerHeight() + 14;

		_popupNode.css({'top': y + 'px', 'left': x + 'px', 'visibility': 'visible'});

		_active = true;


	}

	this.hide = function (){
		_popupNode.css('display', 'none');
		_active = false;
	}

	this.setExtraCSSText = function (css){
		_styleNode.contents(':gt(0)').remove();

		_that.addCSSText(css);

	}

	this.setDefaultCSSText = function (css){

		_that.addCSSText(css);

	}

	this.addCSSText = function (css){

		css = css.replace(/#popup/g, '#' + _popupId);
		_styleNode.append(document.createTextNode(css));

	}

	this.addSearchEngine = function(engine){

		var icon_url = _getIconUrl(engine);
		if (icon_url == undefined)
			icon_url = '#';

		var a = $('<a href="#"><img class="engine-img" src="'+ icon_url +
				'" /><span class="engine-name">'+ engine.name + '</span></a>'
			).data('search_url', engine.url).hover(function(){

				var url = $(this).data('search_url').replace('%s', _lastSelection);

				$(this).attr('href', url);
			})

		if(_options.newtab){
			a.attr('target', '_blank');
		}
		
		_popupNode.append($('<li></li>').append(a));

	}

	this.bindEvents = function(){

		$(document).mousedown(function(e){

			if(_active)
				_that.hide();

	
			if(e.button == 0)
				_isPressed = true;


			if(_doubleClick && !_movedWhilePressed){
				if(e.timeStamp - _doubleClickTime > 130) // we don't want to prevent tripleclick selection
					_movedWhilePressed = true;
			}

			_doubleClick = false;
			
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
				e.preventDefault();

				return;
			}


		});


		$(document).mouseup(function(e){
			if (e.button == 0){
				_upEvent = e;
				_isPressed = false;
			}
		});

		$(document).mousemove(function(e){
			if (_isPressed){
				_movedWhilePressed = true;
			}
		});

		$(document).dblclick(function(e){
			if (e.button == 0){
				_doubleClick = true;
				_downEvent = e;
				_upEvent = e;
				_doubleClickTime = e.timeStamp;

				if(_popupButton == 1){
					_movedWhilePressed = true;
				}
			}
		});

		
		_popupNode.mousedown(function(e){
			e.stopPropagation();
		});



	}

	this.load = function(){
		chrome.extension.sendRequest({}, function(response){
			_that.setDefaultCSSText(response.default_style);
			if(response.extra_style)
				_that.setExtraCSSText(response.extra_style);

			_popupButton = response.options.button;
			_that.setOptions(response.options);

			for (i in response.searchEngines){
				var en = response.searchEngines[i];
				_that.addSearchEngine(en);
			}
		});
	}


	this.getForPreview = function(){

		_setTitle('Lorem ipsum dolor sit amet, consectetur');
		_popupNode.css({'position': 'static', 'display': 'block'});
		return _popupNode;

	}

	this.setOptions = function(opts){
		_options = opts;
	}

	function _setTitle(title){
		_popupNode.children().first().text(title);
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
		return PopUp.getIconUrlFromEngine(engine);

	}

}

PopUp.getIconUrlFromEngine = function(engine) {
	if(engine.icon_url != undefined)
		return engine.icon_url;
	return PopUp.getIconUrl(engine.url);
}
PopUp.getIconUrl = function(url) {
	url = url.replace('http://', '', 'https://', '').split('/')[0];
	if(url == undefined)
		return undefined;
	return 'http://www.google.com/s2/favicons?domain=' + url;
}


 

