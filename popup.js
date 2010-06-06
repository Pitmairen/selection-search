

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
	
	var _buttonId = 'context-search-button-' + _randomId;

	var _buttonNode = $('<div></div>');

	_buttonNode.attr('id', _buttonId);
	_buttonNode.css({
		'position': 'absolute',
		'display' :  'none',
		'zIndex' :  9999999,
		'background-image' : 'url("' + chrome.extension.getURL('icon16.png') + '")',
	});
	$('body').first().append(_buttonNode);


	var _that = this;
	var _active = false;
	var _buttonActive = false;
	var _lastSelection = '';
	var _activator;

	this.options = {};



	_buttonNode.mouseover(function(e){

		_that.show(_buttonNode.offset().left, _buttonNode.offset().top);
	});

	
	this.show = function (x, y){

		if(_buttonActive)
			_that.hideButton();

		var wwidth =  $(window).width() - 5;
		var wheight = $(window).height() - 5;

		if (x - window.pageXOffset + _popupNode.outerWidth() > wwidth)
			x -= (x - window.pageXOffset + _popupNode.outerWidth()) - wwidth;
		else if(x - window.pageXOffset < 5)
			x = window.pageXOffset + 5;
	
		if (y - window.pageYOffset + _popupNode.outerHeight() > wheight)
			y -= (y - window.pageYOffset + _popupNode.outerHeight()) - wheight;
		else if(y - window.pageYOffset < 5)
			y = window.pageYOffset + 5

		_popupNode.css({'top': y + 'px', 'left': x + 'px'});
		_popupNode.show(200);
		_active = true;


	}

	this.showButton = function(x, y){

		var wwidth =  $(window).width() - 5;
		var wheight = $(window).height() - 5;

		if (x - window.pageXOffset + _buttonNode.outerWidth() > wwidth)
			x -= (x - window.pageXOffset + _buttonNode.outerWidth()) - wwidth;
		else if(x - window.pageXOffset < 5)
			x = window.pageXOffset + 5;

		if (y - window.pageYOffset + _buttonNode.outerHeight() > wheight)
			y -= (y - window.pageYOffset + _buttonNode.outerHeight()) - wheight;
		else if(y - window.pageYOffset < 5)
			y = window.pageYOffset + 5

		_buttonNode.css({'top': y + 'px', 'left': x + 'px'});
		_buttonNode.show(100);

		_buttonActive = true;
	}

	this.hide = function (){
		_popupNode.hide(200);
		_active = false;
	}

	this.hideButton = function(){
		_buttonNode.hide(100);
		_buttonActive = false;
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
		css = css.replace(/#button/g, '#' + _buttonId);
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

		if(_that.options.newtab){
			a.attr('target', '_blank');
		}
		
		_popupNode.append($('<li></li>').append(a));

	}

	this.bindEvents = function(){

		_activator.setup();

		_popupNode.mousedown(function(e){
			e.stopPropagation();
		});



	}

	this.load = function(onloaded){
		chrome.extension.sendRequest({}, function(response){
			_that.setDefaultCSSText(response.default_style);
			if(response.extra_style)
				_that.setExtraCSSText(response.extra_style);

			_that.setOptions(response.options);

			for (i in response.searchEngines){
				var en = response.searchEngines[i];
				_that.addSearchEngine(en);
			}

			if(response.options.activator == 'auto')
				_that.setActivator(new AutoActivator(_that));
			else
				_that.setActivator(new ClickActivator(_that));
			_that.bindEvents();


			if(onloaded != undefined)
				onloaded();
		});
	}


	this.setActivator = function(act){

		_activator = act;
	}

	this.getForPreview = function(){

		_setTitle('Lorem ipsum dolor sit amet, consectetur');
		_popupNode.css({'position': 'static', 'display': 'block'});
		return _popupNode;

	}

	this.getButtonForPreview = function(){

		_buttonNode.css({'position': 'static', 'display': 'block'});
		return _buttonNode;

	}

	this.setOptions = function(opts){
		_that.options = opts;
	}

	this.setSelection = function(sel){
		_setTitle(sel);
		_lastSelection = sel;
	}

	this.isActive = function(){
		return _active;
	}

	this.buttonIsActive = function(){
		return _buttonActive;
	}

	this.buttonNode = function(){
		return _buttonNode;
	}

	this.popupNode = function(){
		return _popupNode;
	}


	function _setTitle(title){
		_popupNode.children().first().text(title);
	}

	function _getSelection(){
		return PopUp.getSelection();
	}

	function _hasSelection(){
		return PopUp.hasSelection();
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

PopUp.getSelection = function(){
	return jQuery.trim(window.getSelection().toString());
}

PopUp.hasSelection = function(){
	var sel = PopUp.getSelection();

	if (sel.length == 0)
		return false;

	return sel.indexOf("\n") == -1;
}


PopUp.getSelectionRect = function(){

	var range = window.getSelection().getRangeAt(0);
	if(range)
		return range.getBoundingClientRect();
	return undefined;
}



function ClickActivator(pupup){

	var _doubleClickTime = 0;
	var _popup = popup;

	this.setup = function(){

		$(document).mousedown(function(e){
			
			if(_popup.isActive()){
				_popup.hide();
				return;
			}

			if(e.target.nodeName in {'INPUT':1, 'TEXTAREA':1})
				return;



			if (!PopUp.hasSelection() || e.button != _popup.options.button)
				return;

			// we don't want to prevent tripleclick selection
			if(e.button == 0 && e.timeStamp - _doubleClickTime < 130)
				return;


			var rect = PopUp.getSelectionRect();

			var rx = window.pageXOffset + rect.left;
			var ry = window.pageYOffset + rect.top;

			if (e.pageY >= ry && e.pageY <= ry + rect.height && e.pageX >= rx){

				var sel = PopUp.getSelection();
				_popup.setSelection(sel)
				_popup.show(e.pageX, e.pageY);

				e.stopPropagation();
				e.preventDefault();
			}
	
		});


		$(document).dblclick(function(e){
			if (e.button == 0){
				_doubleClickTime = e.timeStamp;
			}
		});
	}

}



function AutoActivator(pupup){

	var _popup = popup;
	var _lastTimer;

	this.setup = function(){

		$(document).mousedown(function(e){


			if(_lastTimer != undefined)
				window.clearTimeout(_lastTimer);

	
			if(_popup.isActive())
				_popup.hide();
			if(_popup.buttonIsActive())
				_popup.hideButton();

		});

		$(document).mouseup(function(e){

			if(e.button != 0 || _popup.isActive())
				return;
			
			if(e.target.nodeName in {'INPUT':1, 'TEXTAREA':1})
				return;

			if (PopUp.hasSelection()){
				if(_lastTimer != undefined)
					window.clearTimeout(_lastTimer);
				_lastTimer = window.setTimeout(_tryShow, 300, e);

			}
		});

	}

	function _tryShow(e){
		if (PopUp.hasSelection()){


			var rect = PopUp.getSelectionRect();

			var x = window.pageXOffset + rect.right;
			var y = window.pageYOffset + rect.top - popup.buttonNode().height() - 20;

			var sel = PopUp.getSelection();


	
			_popup.setSelection(sel)
			_popup.showButton(x, y);
			_lastTimer = undefined;
		}
	}
}
