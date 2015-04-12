

function PopUp()
{

	var _popupId = Common.getId('popup');

	var _popupNode = $('<ul></ul>');
	_popupNode.append($('<li></li>').append(
		$('<input type="text" />').bind('input', function(){
			_lastSelection = $(this).val();
		})
	));

	_popupNode.attr('id', _popupId).attr('class', Common.getCommonClass());
	_popupNode.css({
		'position': 'absolute',
		'display' :  'none',
		'zIndex' :  9999999,
	});

	$('html').append(_popupNode);

	var _buttonId = Common.getId('button');

	var _buttonNode = $('<div></div>');

	_buttonNode.attr('id', _buttonId).attr('class', Common.getCommonClass());;
	_buttonNode.css({
		'position': 'absolute',
		'display' :  'none',
		'zIndex' :  9999999,
		'background-image' : 'url("' + chrome.extension.getURL('img/icon16.png') + '")',
	});
	$('html').append(_buttonNode);

	var _that = this;
	var _active = false;
	var _buttonActive = false;
	var _lastSelection = '';
	var _activator;
	var _iconsLoaded = false;

	var _urlVariables = [
// 		[/%PAGE_HOSTNAME/g,  encodeURIComponent(location.hostname)],
		[/%PAGE_HOST/g, encodeURIComponent(location.host)],
		[/%PAGE_URL/g, encodeURIComponent(location.href)],
		[/%PAGE_ORIGIN/g, encodeURIComponent(location.origin)],
// 		[/%PAGE_PATH/g, encodeURIComponent(location.pathname)],
	]


	if(location.search.substr(0, 12) == '?javascript:')
		_urlVariables.push([/%PAGE_QUERY_STRING/g, '']);
	else
		_urlVariables.push([/%PAGE_QUERY_STRING/g, encodeURIComponent(location.search.substr(1))]);


// 	var _domain = location.hostname.split('.');
// 	if(_domain.length > 1)
// 		_domain = _domain.slice(1).join('.');
// 	else
// 		_domain = location.hostname;
//
// 	_urlVariables.push([/%PAGE_DOMAIN/g, encodeURIComponent(_domain)]);
//
// 	delete _domain;

	this.options = {};


	_buttonNode.mouseover(function(e){

		_that.show(_buttonNode.offset().left, _buttonNode.offset().top);
	});




	this.show = function (x, y){

		if(_buttonActive)
			_that.hideButton();

		if(!_iconsLoaded){
			_loadIcons();
		}
		var pos = Common.calculateWindowPosition(_popupNode, x, y);

		_popupNode.css({'top': pos.y + 'px', 'left': pos.x + 'px'});
		_popupNode.fadeIn(200);
		_active = true;


	}


	this.showButton = function(x, y){

		var pos = Common.calculateWindowPosition(_buttonNode, x, y);

		_buttonNode.css({'top': pos.y + 'px', 'left': pos.x + 'px'});
		_buttonNode.fadeIn(100);

		_buttonActive = true;
	}

	this.hide = function (){

		_popupNode.fadeOut(200);

		_popupNode.find('ul').hide();


		_active = false;
	}

	this.hideButton = function(){
		_buttonNode.fadeOut(100);
		_buttonActive = false;
	}

	this.addSearchEngine = function(engine){

		_addSearchEngine(engine, _popupNode, 0);

	}

	this.bindEvents = function(){

		_activator.setup();

		_popupNode.mousedown(function(e){
			e.stopPropagation();
		});


		// Load icons after the page has been loaded
		$(document).ready(function(){
			setTimeout(_loadIcons, 500);
		});
	}

	this.setActivator = function(act){

		_activator = act;
	}

	this.getForPreview = function(){

		_setTitle('Lorem ipsum dolor sit amet, consectetur');
		_popupNode.css({'position': 'static', 'display': 'block'});
		_loadIcons();
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
		_popupNode.children().first().children().first().val(title);
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

	function _addFolder(engine, node, level){

		var icon_url = _getIconUrl(engine);
		if (icon_url == undefined)
			icon_url = '#';

		var a = $('<a href="#"></a>');

		if(_that.options.remove_icons == 'no' || (_that.options.remove_icons == 'https' && location.href.substr(0, 5) != 'https'))
			a.append($('<img class="engine-img" />').attr('_src', icon_url));

		a.append(
				$('<span class="engine-name"></span').text(engine.name)
			).attr('title', engine.name);



		var _folderId = Common.getId('popup');

		var _folderNode = $('<ul></ul>');
		_folderNode.append($('<li></li>').hide());

		_folderNode.attr('id', _folderId).attr('class', Common.getCommonClass());
		_folderNode.css({
			'position': 'absolute',
			'display': 'none',
			'zIndex' :  9999999 + level,
		});

		var separate_menus = _that.options.separate_menus;
		for(var i in engine.engines){


			if(separate_menus && engine.engines[i].hide_in_popup)
				continue;

			_addSearchEngine(engine.engines[i], _folderNode, level+1);


		}


		var timer_id = null;
		var hide_id = null;
		var is_visible = false; // This is used to prevent flickering when going from submenu back to the a

		a.mouseenter(function(e){

			if(engine.hidemenu)
				return;
			var that = this;

			if(timer_id){
				clearTimeout(timer_id);
				timer_id= null;
			}

			timer_id = setTimeout(function(){

				timer_id = null;

				if(is_visible)
					return;

				is_visible = true;
				_showSubmenu(_folderNode, that);

			}, 150);

		});



		a.click(function(e){

			if(!engine.openall)
				return false;


			function get_all_links(en, urls){

				for(var i in en.engines){

					var e = en.engines[i];

					if(separate_menus && e.hide_in_popup)
						continue;
					else if(e.url == 'COPY')
						continue;


					if(e.is_submenu){
						urls = get_all_links(e, urls);
					}else{
						urls.push(_createSearchUrl(e.url, _lastSelection, e.post));
					}
				}

				return urls;

			}


			var urls_to_open = get_all_links(engine, []);
			// console.log(urls_to_open);

			chrome.runtime.sendMessage({action:'openUrls', urls:urls_to_open, background_tab:engine.background_tab});


			if(_that.options.hide_on_click && _that.isActive()){
				_that.hide();
			}
			else if(engine.hide_on_click && _that.isActive())
				_that.hide();



			return false;
		});




		node.append(

			$('<li class="engine-submenu"></li>').css('position', 'relative').append(a).append(_folderNode).mouseleave(function(e){

				if(engine.hidemenu)
					return;

				if(timer_id){
					clearTimeout(timer_id);
					timer_id = null;
				}

				var that = this;
				hide_id = setTimeout(function(){
					hide_id = null;
					is_visible = false;
					$(that).find('ul').fadeOut(200);
				}, 200);


			}).mouseenter(function(e){

				if(hide_id){
					clearTimeout(hide_id);
					hide_id = null;
				}

			})
		);
	}



	function _addSearchEngine(engine, node, level){

		if(engine.is_submenu)
			return _addFolder(engine, node, level+1);
		if(engine.is_separator)
			return _addSeparator(engine, node, level);

		var icon_url = _getIconUrl(engine);
		if (icon_url == undefined)
			icon_url = '#';

		var a = $('<a href="#"></a>');

		if(_that.options.remove_icons == 'no' || (_that.options.remove_icons == 'https' && location.href.substr(0, 5) != 'https'))
			a.append($('<img class="engine-img" />').attr('_src', icon_url));

		a.append(
				$('<span class="engine-name"></span').text(engine.name)
			).attr('title', engine.name).data('search_url', engine.url).data('engine-post', engine.post || false).mouseenter(function(){


				var url = _createSearchUrl($(this).data('search_url'), _lastSelection, $(this).data('engine-post'));

				$(this).attr('href', url);
			}).click(function(){

				if(_that.options.hide_on_click && _that.isActive())
					_that.hide();
				else if(engine.hide_on_click && _that.isActive())
					_that.hide();

			});


		if(engine.url == 'COPY'){
			a.click(function(){
				chrome.runtime.sendMessage({action:'copy', content: PopUp.getSelection()});
				return false;
			});
		}
		else if(engine.url.substr(0, 11) !== 'javascript:'){

			if(_that.options.newtab){

				if(_that.options.background_tab || engine.background_tab){
					a.click(function(){

						chrome.runtime.sendMessage({action:'openUrls', urls:[$(this).attr('href')], background_tab:engine.background_tab});

						return false;
					});
				}
				else
					a.attr('target', '_blank');

			}

		}

		node.append($('<li></li>').append(a));

	}


	function _addSeparator(engine, node, level){

		node.append($('<li class="engine-separator"></li>'))

	}

	function _showSubmenu(node, parent){


		var pos = Common.calculateSubmenuPosition(node, $(parent));


		node.css({'top': pos.y + 'px', 'left': pos.x + 'px'});

		node.fadeIn(200);
	}



	function _loadIcons(){

		if(_iconsLoaded)
			return;
		_iconsLoaded = true;

		$('img[_src]', _popupNode).each(function(){

			$(this).attr('src', $(this).attr('_src')).removeAttr('_src');
		});


	}

	function _createSearchUrl(search_url, selection, is_post){


		for(var i=0; i<_urlVariables.length; ++i){
			search_url = search_url.replace(_urlVariables[i][0], _urlVariables[i][1]);
		}


		if(search_url.match(/%PAGE_QS_VAR\(.+?\)/)){
			search_url = _replaceQueryStringVars(search_url);
		}

		var url = '';
		//If its a post url we encode only the part before {POSTARGS}
		if(is_post){
			var parts = search_url.split('{POSTARGS}', 2);
			if(parts.length == 2){
				// url = parts[0].replace(/%s/g, encodeURIComponent(selection));
				url = Common.replaceSearchPlaceholder(parts[0], selection);

				url += '{POSTARGS}' + parts[1].replace(/%s/g, selection);
			}else{
				// url = search_url.replace(/%s/g, encodeURIComponent(selection));
				url = Common.replaceSearchPlaceholder(search_url, selection);
			}

			url = chrome.extension.getURL('postsearch.html') + '?url='+encodeURIComponent(url);
		}
		else{

			var placeholder = search_url;


			// Special case for only "%s" engine
			// to allow opening of selected urls
			var sel = '';
			if(placeholder == '%s'){
				if(!selection.match(/^(https?|ftp):\/\//))
					sel = 'http://' + selection;
				else
					sel = selection;
				url = sel;
			}
			else{
				// sel = encodeURIComponent(selection);
				url = Common.replaceSearchPlaceholder(search_url, selection);

				// url = search_url.replace(/%s/g, sel);
			}
		}


		return url;

	}


	function _replaceQueryStringVars(search_url){

		var qs_map = {}
		if(location.search.length != 0){
			var qs = location.search.substr(1);
			jQuery.each(qs.split('&'), function(index, value){

				var qs_var = value.split('=');

				if (qs_var.length == 2){
					qs_map[qs_var[0]] = qs_var[1];
				}
			});
		}

		search_url = search_url.replace(/%PAGE_QS_VAR\((.+?)\)/g, function(m, qs_key){
			if (qs_key in qs_map){

				if(qs_map[qs_key].substr(0, 11) === 'javascript:')
					return '';
				return encodeURIComponent(qs_map[qs_key]);
			}
			return '';
		});
		return search_url;
	}

}

PopUp.getIconUrlFromEngine = function(engine) {
	if(engine.icon_url != undefined){
		if(engine.icon_url == 'CURRENT_DOMAIN')
			return 'https://plus.google.com/_/favicon?domain=' + window.location.host;
		return engine.icon_url;
	}
	else if(engine.url == 'COPY')
		return chrome.extension.getURL('img/copy.png');
	else if(engine.is_submenu)
		return chrome.extension.getURL('img/folder.png');
	return PopUp.getIconUrl(engine.url);
}
PopUp.getIconUrl = function(url) {
	url = url.replace('http://', '', 'https://', '').split('/')[0];
	if(url == undefined)
		return undefined;
	return 'https://plus.google.com/_/favicon?domain=' + url;
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



function ClickActivator(_popup, in_combo){

	var _doubleClickTime = 0;

	this.setup = function(){

		$(document).mousedown(function(e){

			if(!in_combo && _popup.isActive()){
				_popup.hide();
				return;
			}

			var in_input = false;
			if(e.target.nodeName in {'INPUT':1, 'TEXTAREA':1}){
				if(!e.ctrlKey || !_popup.options.show_in_inputs)
					return;
				in_input = true;
			}


			if (!PopUp.hasSelection() || e.button != _popup.options.button)
				return;

			// we don't want to prevent tripleclick selection
			if(e.button == 0 && e.timeStamp - _doubleClickTime < 130)
				return;


			var rx = window.pageXOffset;
			var ry = window.pageYOffset;

			var rect = PopUp.getSelectionRect();

			if(rect){
				rx += rect.left;
				ry += rect.top;
			}

			if (in_input || (e.pageY >= ry && e.pageY <= ry + rect.height && e.pageX >= rx && e.pageX <= rx + rect.width)){

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



function DoubleClickActivator(_popup){

	var _doubleTimer = null;

	this.setup = function(){

		$(document).mousedown(function(e){
			if(_doubleTimer != null)
				clearTimeout(_doubleTimer);
		});


		$(document).dblclick(function(e){

			_doubleTimer = setTimeout(function(){

				_doubleTimer = null;

				if (!PopUp.hasSelection())
					return;

				var sel = PopUp.getSelection();
				_popup.setSelection(sel)
				_popup.show(e.pageX, e.pageY);

				e.stopPropagation();
				e.preventDefault();

			}, 100);


		});
	}




}


function AutoActivator(_popup, in_combo){

	var _lastTimer;
	var _startedInInput = false;

	this.setup = function(){

		$(document).mousedown(function(e){


			if(_lastTimer != undefined)
				window.clearTimeout(_lastTimer);

			_startedInInput = false;

			if(!in_combo && _popup.isActive())
				_popup.hide();
			if(_popup.buttonIsActive())
				_popup.hideButton();


			if(e.target.nodeName in {'INPUT':1, 'TEXTAREA':1}){
				_startedInInput = true;
				if(!e.ctrlKey || !_popup.options.show_in_inputs)
					return;

				if(PopUp.hasSelection() && e.button == 0){

					var sel = PopUp.getSelection();
					_popup.setSelection(sel)
					_popup.show(e.pageX, e.pageY);

					e.stopPropagation();
					e.preventDefault();

				}
			}

		});

		$(document).mouseup(function(e){

			if(_startedInInput)
				return;

			if(e.button != 0 || _popup.isActive())
				return;

			if (PopUp.hasSelection()){
				if(_lastTimer != undefined)
					window.clearTimeout(_lastTimer);
				_lastTimer = window.setTimeout(_tryShow, 300, e);
			}
		});

	}

	function _tryShow(e){
		if (PopUp.hasSelection() && !_popup.isActive()){

			var sel = PopUp.getSelection();
			_popup.setSelection(sel);

			var rect = PopUp.getSelectionRect();
			var x = window.pageXOffset + rect.right;
			var y = window.pageYOffset + rect.top - _popup.buttonNode().height() - 20;

			_popup.showButton(x, y);

			_lastTimer = undefined;

		}
	}
}



function KeyAndMouseActivator(_popup, in_combo){

	var _keys = {}; // Keybard Combo
	var _mouseButton = 0;

	this.setup = function(){

		var combo = _popup.options.k_and_m_combo;
		var e = combo.length - 1;
		for(var i=0; i<e; ++i){
			_keys[combo[i]] = false;
		}

		_mouseButton = combo[combo.length-1];

		// Disable context menu if right click is used
		if(_mouseButton == 2){

			$(document).bind('contextmenu', function (e){
				if (PopUp.hasSelection() && is_keyboard_combo_activated() && _mouseButton == e.button)
					return false;
			});

		}
		$(document).keydown(function(e){

			if(e.which in _keys)
				_keys[e.which] = true;
		});

		$(document).keyup(function(e){

			if(e.which in _keys)
				_keys[e.which] = false;
		});


		$(document).mousedown(function(e){

			if(!in_combo && _popup.isActive()){
				_popup.hide();
				return;
			}


			if (!PopUp.hasSelection() || !is_keyboard_combo_activated() || _mouseButton != e.button)
				return;

			var sel = PopUp.getSelection();
			_popup.setSelection(sel)
			_popup.show(e.pageX, e.pageY);

			e.stopPropagation();
			e.preventDefault();

		});

	}

	function is_keyboard_combo_activated(){

		for (key in _keys){
			if(!_keys[key])
				return false;
		}
		return true;

	}

}


function ComboActivator(_popup, activators){
    


    this.setup = function(){
        
		$(document).mousedown(function(e){

			if(_popup.isActive()){
				_popup.hide();
		    }

        });

        for(var i in activators){
            activators[i].setup();
        }


    }

}


