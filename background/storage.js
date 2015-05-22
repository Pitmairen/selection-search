
var Storage = new function (){

    _SEARCH_ENGINES_KEY = 'searchEngines';
    _STYLE_KEY = 'styleSheet';
    _BUTTON_KEY = 'button'; // Used in previous versions
    _OPTIONS_KEY = 'options';
    _SYNC_KEY = 'sync';

    var _defaultEngines = searchEngines = [
        {name: 'Google', url: 'http://google.com/search?q=%s'},
        {name: 'Youtube', url: 'http://www.youtube.com/results?search_query=%s'},
        {name: 'Stackoverflow', url: 'http://stackoverflow.com/search?q=%s'}
    ];

    var _defaultOptions = {
        button: 1,
        newtab: false,
        activator: 'click',
        remove_icons: 'no',
        show_in_inputs: true,
        background_tab: true,
        k_and_m_combo: [17, 0], // Keyboard and Mouse activator comination [Key, Key, ..., Mouse] (default [Ctrl, left button])
        context_menu: 'disabled',
        separate_menus: false,
        hide_on_click: false,
        disable_formextractor: false,
        open_on_dblclick: false,
        open_new_tab_last: false,
        disable_effects: false,
        activator_combo: [],
    };

    var _syncOptions = {
        sync_engines: true,
        sync_settings: true,
        sync_style: true
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

    this.getSyncOptions = function(){

        var options  = JSON.parse(_getValue(_SYNC_KEY, '{}'));

        return $.extend({}, _syncOptions, options);

    }


    this.setSearchEngines = function(engines){
        _setValue(_SEARCH_ENGINES_KEY, JSON.stringify(engines));

    }

    this.setStyle = function(style){

        style = _fixCSSAfterVersion_0_8_1(style);

        _setValue(_STYLE_KEY, style);

    }

    this.setOptions = function(options){

        if(localStorage[_BUTTON_KEY] != undefined)
            _removeValue(_BUTTON_KEY);


        _setValue(_OPTIONS_KEY, JSON.stringify(options))
    }

    this.setSyncOptions = function(options){

        _setValue(_SYNC_KEY, JSON.stringify(options))
    }


    this.clear = function(style){

        //localStorage.clear(); // This will clear VERSION stored in the background tab
        _that.clearStyle();
        _that.clearSearchEngines();
        _that.clearButton();
        _that.clearOptions();
        _that.clearSyncOptions();

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

    this.clearSyncOptions = function(){
        _removeValue(_SYNC_KEY);
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


    var _prevVersion = undefined;

    function _versionIsNewer(new_version)
    {
        if(_prevVersion === undefined)
            return false;

        return _prevVersion < new_version;

    }




    this.storage_upgrades = function(prev_version){

        _prevVersion = prev_version;


        var opts = _that.getOptions();

        v0_5_9__v0_6_0(opts);
        v0_7_12__v0_7_13(opts);

        var style = _that.getStyle();
        v0_7_26__v0_8_1(opts, style);

    }


    function _fixCSSAfterVersion_0_8_1(css){

        css = css.replace(/#popup/g, ".popup");
        css = css.replace(/#button/g, ".button");
        css = css.replace(/#engine-editor/g, ".engine-editor");

        return css;

    }


    function v0_7_26__v0_8_1(opts, style){

        if(!_versionIsNewer('0.8.1'))
            return;

        // Fix is done in setStyle 
        _that.setStyle(style);

        opts.remove_icons = 'no';
        delete opts.use_default_style;

        _that.setOptions(opts);


    }


    // v0.5.9 -> v0.6.0
    function v0_5_9__v0_6_0(opts){


        if(opts.activator == 'contextmenu'){
            opts.activator = 'disabled';
            opts.context_menu = 'enabled';

            _that.setOptions(opts);
        }
    }


    function v0_7_12__v0_7_13(opts){

        if(!_versionIsNewer('0.7.13'))
            return;

        _that.setSyncOptions({
            sync_engines : false,
            sync_settings : false,
            sync_style : false
        });

        var notification = webkitNotifications.createNotification(
            'img/icon48.png',
            'Online Synchronization',
            'Synchronization of search engines and settings between browsers is now available. It has been disabled by default, but can be enabled in the settings.'
        );

        notification.show();



    }
}

