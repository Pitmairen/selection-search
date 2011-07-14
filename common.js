

var Common = new function(){

	var _randomId = (Math.random()*10).toString().replace('.', '');

	var _generatedValues = {};

	var _styleNode = null;

	var _styleConfig = {
		"submenu_corner" : "topleft", // Which corner of the submenu to place at which corner of the submenu-link defined by the "submenu_position" config option
		"submenu_position" : "topright",
		
	};

	_that = this;

	this.init = function(){

		_styleNode = $('<style type="text/css"></style>');

		$('html').append(_styleNode);

// 		if ($('head').length > 0)
// 			$('head').first().append(_styleNode);
// 		else
// 			$('body').append(_styleNode);
	}

	
	this.getId =function(id){
		var new_id = id + '-' + _randomId;

		if (!('#'+id in _generatedValues))
			_generatedValues['#'+id] = '#' +new_id;

		return new_id;
	}

	this.getCommonClass = function(){
		var class_ = 'common-' + _randomId;
		if (!('.common' in _generatedValues))
			_generatedValues['.common'] = '.'+class_;
		return class_;
	},

	this.replaceCSS = function(content){

		for (var value in _generatedValues){
			var new_value = _generatedValues[value];
			content = content.replace(new RegExp(value, 'g'), new_value);
		}
		return content;
	}

	this.setStyleSheet = function(css){
		_styleNode.contents(':gt(0)').remove();


		this.parseStyleOptions(css);

		
		_that.addStyleSheet(css);
	}

	this.addStyleSheet = function(css){
		
		_styleNode.append(document.createTextNode(_that.replaceCSS(css)));
	
	}


	/* This searches for a inline config section in the css data */
	this.parseStyleOptions = function(css){

		var match = css.match(/\/*CONFIG_START{([\s\S]*)}CONFIG_END\*\//);

		if(!match)
			return;

		var config = '{' + match[1] + '}';

		try{
			var config = JSON.parse(config);
		}catch(err){
			return;
		}

		if(config.hasOwnProperty('submenu_corner') && config['submenu_corner'].match(/^(top|bottom)(right|left)$/))
			_styleConfig['submenu_corner'] = config['submenu_corner'];

		if(config.hasOwnProperty('submenu_position') && config['submenu_position'].match(/^(top|bottom)(right|left)$/))
			_styleConfig['submenu_position'] = config['submenu_position'];
		
	}


	this.getStyleOption = function(key){
		return _styleConfig[key];
	}


	this.calculateSubmenuPosition = function(menu, linknode){

		var x = 0;
		var y = 0;


		var pos = this.getStyleOption('submenu_position').match(/^(top|bottom)(right|left)$/);

		if(pos[1] == 'bottom')
			y = linknode.outerHeight();
		if(pos[2] == 'right')
			x = linknode.outerWidth();


		var corner = this.getStyleOption('submenu_corner').match(/^(top|bottom)(right|left)$/);


		menu.css({'visibility': 'hidden', 'display': 'block'});
		
		if(corner[1] == 'bottom')
			y -= menu.outerHeight();

		if(corner[2] == 'right')
			x -= menu.outerWidth();


		var abs_x = x + linknode.offset().left;
		var abs_y = y + linknode.offset().top;

		var wwidth =  $(window).width() - 5;
		var wheight = $(window).height() - 5;

		
		if(abs_x - window.pageXOffset + menu.outerWidth() > wwidth)
			x = 0 - menu.outerWidth();

		else if(abs_x - window.pageXOffset < 5)
			x = linknode.outerWidth();


		if(abs_y - window.pageYOffset + menu.outerHeight() > wheight)
			y -= (abs_y - window.pageYOffset + menu.outerHeight()) - wheight;

		else if(abs_y - window.pageYOffset < 5)
			y += (window.pageYOffset + 5) - abs_y;


		menu.css({'visibility': 'visible', 'display': 'none'});

		return {x:x, y:y};

	}
}




Common.calculateWindowPosition = function(node, x, y){
	var wwidth =  $(window).width() - 5;
	var wheight = $(window).height() - 5;


	if (x - window.pageXOffset + node.outerWidth() > wwidth)
		x -= (x - window.pageXOffset + node.outerWidth()) - wwidth;
	else if(x - window.pageXOffset < 5)
		x = window.pageXOffset + 5;

	if (y - window.pageYOffset + node.outerHeight() > wheight)
		y -= (y - window.pageYOffset + node.outerHeight()) - wheight;
	else if(y - window.pageYOffset < 5)
		y = window.pageYOffset + 5;

	return {'x':x, 'y':y}

}