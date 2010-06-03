
var Storage = new function (){

	_SEARCH_ENGINES_KEY = 'searchEngines';
	_STYLE_KEY = 'styleSheet';
	_BUTTON_KEY = 'button';

	var _defaultEngines = searchEngines = [
		{name: 'Google', url: 'http://google.com/search?q=%s'},
		{name: 'Youtube', url: 'http://www.youtube.com/results?search_query=%s'},
		{name: 'Stackoverflow', url: 'http://stackoverflow.com/search?q=%s'}
	];

	var _that = this;
	
	this.getSearchEngines = function(){

		var engines =  _getValue(_SEARCH_ENGINES_KEY);

		if(engines != undefined)
			engines = JSON.parse(engines);
		else
			engines = [];
		
		if(engines.length == 0)
			return _defaultEngines;
		return engines;
	}

	this.getStyle = function(default_value){

		return _getValue(_STYLE_KEY, default_value);

	}

	this.getButton = function(){
		return parseInt(_getValue(_BUTTON_KEY, 1), 10);
	}

	this.setButton = function(button){
		return _setValue(_BUTTON_KEY, button.toString());
	}

	this.setSearchEngines = function(engines){
		_setValue(_SEARCH_ENGINES_KEY, JSON.stringify(engines));
	}

	this.setStyle = function(style){

		_setValue(_STYLE_KEY, style);

	}


	this.clear = function(style){

		_that.clearStyle();
		_that.clearSearchEngines();
		_that.clearButton();

	}

	this.clearStyle = function(){
		_removeValue(_STYLE_KEY);
	}

	this.clearSearchEngines = function(){
		_removeValue(_SEARCH_ENGINES_KEY);
	}
	this.clearButton = function(){
		_removeValue(_BUTTON_KEY);
	}

	function _getValue(key, default_value, parse_json){

		var value = localStorage[key];

		if(value == undefined)
			return default_value;
		return value;

	}

	function _setValue(key, value){

		localStorage[key] = value;
	}

	function _removeValue(key){
		localStorage.removeItem(key);
	}
}