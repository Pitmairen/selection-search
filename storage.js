
var Storage = new function (){

	_SEARCH_ENGINES_KEY = 'searchEngines';
	_STYLE_KEY = 'styleSheet';
	_BUTTON_KEY = 'button'; // Used in previous versions
	_OPTIONS_KEY = 'options';

	var _defaultEngines = searchEngines = [
		{name: 'Google', url: 'http://google.com/search?q=%s'},
		{name: 'Youtube', url: 'http://www.youtube.com/results?search_query=%s'},
		{name: 'Stackoverflow', url: 'http://stackoverflow.com/search?q=%s'}
	];
	
	var _defaultOptions = {
		button: 1,
		newtab: false,
		activator: 'click',
		remove_icons: 'https',
		use_default_style: true,
		show_in_inputs: true,
		background_tab: true,
		k_and_m_combo: [17, 0], // Keyboard and Mouse activator comination [Key, Key, ..., Mouse] (default [Ctrl, left button])
		context_menu: 'disabled',
		separate_menus: false
	};

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


	this.getOptions = function(){
		var options  = JSON.parse(_getValue(_OPTIONS_KEY, '{}'));

		// Before it was stored as its own value
		if(localStorage[_BUTTON_KEY] != undefined)
			options.button = _that.getButton();

		return $.extend({}, _defaultOptions, options);

	}


	this.setSearchEngines = function(engines){
		_setValue(_SEARCH_ENGINES_KEY, JSON.stringify(engines));
	}

	this.setStyle = function(style){

		_setValue(_STYLE_KEY, style);

	}

	this.setOptions = function(options){

		if(localStorage[_BUTTON_KEY] != undefined)
			_removeValue(_BUTTON_KEY);

		
		_setValue(_OPTIONS_KEY, JSON.stringify(options))
	}


	this.clear = function(style){

		//localStorage.clear(); // This will clear VERSION stored in the background tab
		_that.clearStyle();
		_that.clearSearchEngines();
		_that.clearButton();
		_that.clearOptions();

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

	this.clearOptions = function(){
		_removeValue(_OPTIONS_KEY);
	}

	this.getValue = function(key, default_value){
		return _getValue(key, default_value);
	}

	this.setValue = function(key, value){

		_setValue(key, value);
	}

	this.removeValue = function(key){
		_removeValue(key);
	}


	function _getValue(key, default_value){

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




	// Storage Upgrades:

	
	this.storage_upgrades = function(){

		v0_5_9__v0_6_0();

	}


	// v0.5.9 -> v0.6.0
	function v0_5_9__v0_6_0(){

		var opts = _that.getOptions();

		if(opts.activator == 'contextmenu'){
			opts.activator = 'disabled';
			opts.context_menu = 'enabled';

			_that.setOptions(opts);
		}
	}
}

