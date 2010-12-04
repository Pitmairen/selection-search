

var Common = new function(){

	var _randomId = (Math.random()*10).toString().replace('.', '');

	var _generatedValues = {};

	var _styleNode = null;

	_that = this;

	this.init = function(){

		_styleNode = $('<style type="text/css"></style>');

		if ($('head').length > 0)
			$('head').first().append(_styleNode);
		else
			$('body').append(_styleNode);
	}

	
	this.getId =function(id){
		var new_id = id + '-' + _randomId;

		if (!('#'+id in _generatedValues))
			_generatedValues['#'+id] = '#' +new_id;

		return new_id;
	}

	this.getCommonClass = function(){
		var class = 'common-' + _randomId;
		if (!('.common' in _generatedValues))
			_generatedValues['.common'] = '.'+class;
		return class;
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

		_that.addStyleSheet(css);
	}

	this.addStyleSheet = function(css){
		
		_styleNode.append(document.createTextNode(_that.replaceCSS(css)));
	
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
		y = window.pageYOffset + 5

	return {'x':x, 'y':y}

}