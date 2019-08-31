
// Global main storage object used to store user settings
var Storage = new DataStore(new MemoryKWStore());

function DataStore(kwStore){

    var _SEARCH_ENGINES_KEY = 'searchEngines';
    var _STYLE_KEY = 'styleSheet';
    var _BUTTON_KEY = 'button'; // Used in previous versions
    var _OPTIONS_KEY = 'options';
    var _BLACKLIST_KEY = 'blacklist';
    var _SYNC_KEY = 'sync';
    var _CLICK_COUNT_KEY = 'click-count';
    var _VERSION_KEY = 'VERSION';

    var _defaultEngines = searchEngines = [
        {name: 'Google', url: 'http://google.com/search?q=%s'},
        {name: 'Youtube', url: 'http://www.youtube.com/results?search_query=%s'},
        {name: 'Stackoverflow', url: 'http://stackoverflow.com/search?q=%s'}
    ];

    var _defaultOptions = {
        button: 0,
        newtab: false,
        activator: 'click',
        remove_icons: 'no',
        show_in_inputs: true,
        background_tab: true,
        k_and_m_combo: [17, 0], // Keyboard and Mouse activator comination [Key, Key, ..., Mouse] (default [Ctrl, left button])
        context_menu: 'disabled',
        toolbar_popup: 'enabled',
        toolbar_popup_style: 'default',
        toolbar_popup_hotkeys: false,
        toolbar_popup_suggestions: true,
        separate_menus: false,
        hide_on_click: false,
        disable_formextractor: false,
        open_on_dblclick: false,
        dblclick_in_inputs: true,
        open_new_tab_last: false,
        disable_effects: false,
        auto_popup_relative_to_mouse: false,
        auto_popup_show_menu_directly: false,
        auto_popup_in_inputs: false,
        activator_combo: [],
        show_tooltips: false,
        circular_menu: false,
        sort_by_click: false, // Sort the search engines by usage count
        selection_length_limit: -1,
        auto_hide_delay: 0,
        auto_open_delay: 300,
        selection_allow_newline: false,
        use_whitelist: false, // If enabled, the blacklist will be used as a whitelist
    };

    var _blacklist = [];

    var _syncOptions = {
        sync_engines: true,
        sync_settings: true,
        sync_style: true
    };

    var _storageListeners = [];

    var _that = this;

    // Directly update the internal kw store with the 
    // key => values provided in the data, without triggering
    // the listeners.
    this.setData = function(data){
        for(let key in data){
            kwStore[key] = data[key];
        }
    }

    this.addListener = function(listener){
        _storageListeners.push(listener);
    }

    this.getVersion = function(){
        return _getValue(_VERSION_KEY);
    }

    this.getClickCount = function(){
        return _getValue(_CLICK_COUNT_KEY, {});
    }

    this.getSearchEngines = function(){

        var engines =  _getValue(_SEARCH_ENGINES_KEY, []);

        if(engines.length == 0)
            return _defaultEngines;
        return engines;
    }

    this.getStyle = function(default_value){
        if(default_value === undefined){
            default_value = ''
        }
        return _getValue(_STYLE_KEY, default_value);
    }

    this.getButton = function(){
        return _getValue(_BUTTON_KEY, 0);
    }


    this.getOptions = function(){
        var options  = _getValue(_OPTIONS_KEY, {});

        // Before it was stored as its own value
        if(kwStore[_BUTTON_KEY] != undefined)
            options.button = _that.getButton();

        return $.extend({}, _defaultOptions, options);

    }

    this.getBlacklistDefinitions = function(){
        return _getValue(_BLACKLIST_KEY, []);
    }

    this.getSyncOptions = function(){

        var options  = _getValue(_SYNC_KEY, {});

        return $.extend({}, _syncOptions, options);
    }

    this.setVersion = function(version){
        return _setValue(_VERSION_KEY, version);
    }

    this.setSearchEngines = function(engines){
        _setValue(_SEARCH_ENGINES_KEY, engines);
    }

    this.setStyle = function(style){

        style = _fixCSSAfterVersion_0_8_1(style);

        _setValue(_STYLE_KEY, style);

    }

    this.setOptions = function(options){

        if(kwStore[_BUTTON_KEY] != undefined)
            _removeValue(_BUTTON_KEY);

        _setValue(_OPTIONS_KEY, options);
    }

    this.setBlacklistDefinitions = function(blacklist){
        _setValue(_BLACKLIST_KEY, blacklist);
    }

    this.setSyncOptions = function(options){
        _setValue(_SYNC_KEY, options);
    }

    this.setClickCount = function(clickCount){
        return _setValue(_CLICK_COUNT_KEY, clickCount);
    }

    this.clear = function(style){

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


    // Checks if  this storage is different from the other storage
    this.hasChanges = function(other){
        if(!_eq(this.getOptions(), other.getOptions())){
            return true;
        } else if(!_eq(this.getStyle(''), other.getStyle(''))){
            return true;
        } else if(!_eq(this.getSearchEngines(), other.getSearchEngines())){
            return true;
        } else if(!_eq(this.getBlacklistDefinitions(), other.getBlacklistDefinitions())){
            return true;
        } else if(!_eq(this.getSyncOptions(), other.getSyncOptions())){
            return true;
        } else {
            return false;
        }
    }

    // Copies the other storage storage into this storage
    this.copyInto = function(other){
        other.setOptions(this.getOptions());
        other.setStyle(this.getStyle(''));
        other.setSearchEngines(this.getSearchEngines());
        other.setBlacklistDefinitions(this.getBlacklistDefinitions());
        other.setSyncOptions(this.getSyncOptions());
    }

    function _getValue(key, default_value){

        var value = kwStore[key];

        if(value == undefined)
            return default_value;
        return value;

    }

    function _setValue(key, value){

        kwStore[key] = value;

        _storageListeners.forEach(listener => {
            listener.valueChanged(key, value);
        });
    }

    function _removeValue(key){
        kwStore.removeItem(key);

        _storageListeners.forEach(listener => {
            listener.valueRemoved(key);
        });
    }




    // Storage Upgrades:


    var _prevVersion = undefined;

    function _versionIsNewer(new_version)
    {
        if(_prevVersion === undefined)
            return false;

        return _prevVersion < new_version;

    }




    this.storage_upgrades = function(prev_version, import_from_localstorage){

        _prevVersion = prev_version;

        if(import_from_localstorage === undefined || import_from_localstorage){
            v0_8_48_load_from_localstorage();
        }

        var opts = _that.getOptions();

        v0_5_9__v0_6_0(opts);
        v0_7_12__v0_7_13(opts);

        var style = _that.getStyle('');
        v0_7_26__v0_8_1(opts, style);

        style = _that.getStyle('');
        v0_8_3__v0_8_4(style);
        v0_8_8_style_bugfix(style);
    }


    function _fixCSSAfterVersion_0_8_1(css){

        css = css.replace(/#popup/g, ".popup");
        css = css.replace(/#button/g, ".button");
        css = css.replace(/#engine-editor/g, ".engine-editor");

        return css;

    }

    function v0_8_48_load_from_localstorage(){
        if(!_versionIsNewer('0.8.48')){
            return;
        }
        else if(localStorage['IMPORTED'] === '1'){
            // If we have already imported the data, we skip
            return;
        }


        // When setting the values, the storage local syncer listern should store
        // the values in the chrome.storage.local.
        _setValue(_OPTIONS_KEY, JSON.parse(_getFromOldLocalStorage(_OPTIONS_KEY, '{}')));
        _setValue(_STYLE_KEY, _getFromOldLocalStorage(_STYLE_KEY, ''));
        _setValue(_SYNC_KEY, JSON.parse(_getFromOldLocalStorage(_SYNC_KEY, '{}')));

        var engines =  _getFromOldLocalStorage(_SEARCH_ENGINES_KEY);

        if(engines !== undefined){
            engines = JSON.parse(engines);
        }

        _setValue(_SEARCH_ENGINES_KEY, engines);
        _setValue(_BLACKLIST_KEY, JSON.parse(_getFromOldLocalStorage(_BLACKLIST_KEY, '[]')));
        _setValue(_CLICK_COUNT_KEY, JSON.parse(_getFromOldLocalStorage(_CLICK_COUNT_KEY, '{}')));
        _setValue(_VERSION_KEY, localStorage[_VERSION_KEY]);

        localStorage['IMPORTED'] = '1';
        localStorage['NO-LONGER-USED'] = 'These settings in localStorage are no longer used. They were used for older versions of the extension, and can be safely removed when using selection search version 0.8.48 or higher.';
    }

    function _getFromOldLocalStorage(key, default_value){
        var value = localStorage[key];
        if(value == undefined)
            return default_value;
        return value;

    }

    function v0_8_8_style_bugfix(style){

        if(!_versionIsNewer('0.8.8'))
            return;

        // Fix for bug in "No selection" style
        // The style template was not updated in version 0.8.3 -> 0.8.4 so someone
        // who has selected this style after the update has not gotten the fix
        // in the storege upgrade for the 0.8.3 -> 0.8.4.
        style = style.replace(/\.popup li:first-child\b/g, ".mainmenu > li:first-child");

        _that.setStyle(style);
    }

    function v0_8_3__v0_8_4(style){

        if(!_versionIsNewer('0.8.4'))
            return;

        style = style.replace(/\.popup li:first-child\b/g, ".popup.mainmenu > li:first-child");

        _that.setStyle(style);

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

        chrome.notifications.create({
            type: 'basic',
            iconUrl: '/img/icon48.png',
            title: 'Online Synchronization',
            message: 'Synchronization of search engines and settings between browsers is now available. It has been disabled by default, but can be enabled in the settings.'
        });

    }


    //
    // Taken and slightly modified from https://github.com/jashkenas/underscore
    // Used to detect changes in the settings on the options page.
    //
    function _eq(a, b, aStack, bStack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
        if (a === b) return a !== 0 || 1 / a === 1 / b;
        // `null` or `undefined` only equal to itself (strict comparison).
        if (a == null || b == null) return false;
        // `NaN`s are equivalent, but non-reflexive.
        if (a !== a) return b !== b;
        // Exhaust primitive checks
        var type = typeof a;
        if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
        return _deepEq(a, b, aStack, bStack);
    };

    // Internal recursive comparison function for `isEqual`.
    function _deepEq(a, b, aStack, bStack) {
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className !== toString.call(b)) return false;
        switch (className) {
            // Strings, numbers, regular expressions, dates, and booleans are compared by value.
            case '[object RegExp]':
            // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
            case '[object String]':
                // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                // equivalent to `new String("5")`.
                return '' + a === '' + b;
            case '[object Number]':
                // `NaN`s are equivalent, but non-reflexive.
                // Object(NaN) is equivalent to NaN.
                if (+a !== +a) return +b !== +b;
                // An `egal` comparison is performed for other numeric values.
                return +a === 0 ? 1 / +a === 1 / b : +a === +b;
            case '[object Date]':
            case '[object Boolean]':
                // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                // millisecond representations. Note that invalid dates with millisecond representations
                // of `NaN` are not equivalent.
                return +a === +b;
        }

        var areArrays = className === '[object Array]';
        if (!areArrays) {
            if (typeof a != 'object' || typeof b != 'object') return false;
        }
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

        // Initializing stack of traversed objects.
        // It's done here since we only need them for objects and arrays comparison.
        aStack = aStack || [];
        bStack = bStack || [];
        var length = aStack.length;
        while (length--) {
            // Linear search. Performance is inversely proportional to the number of
            // unique nested structures.
            if (aStack[length] === a) return bStack[length] === b;
        }

        // Add the first object to the stack of traversed objects.
        aStack.push(a);
        bStack.push(b);

        // Recursively compare objects and arrays.
        if (areArrays) {
            // Compare array lengths to determine if a deep comparison is necessary.
            length = a.length;
            if (length !== b.length) return false;
            // Deep compare the contents, ignoring non-numeric properties.
            while (length--) {
                if (!_eq(a[length], b[length], aStack, bStack)) return false;
            }
        } else {
            // Deep compare objects.
            var keys = Object.keys(a), key;
            length = keys.length;
            // Ensure that both objects contain the same number of properties before comparing deep equality.
            if (Object.keys(b).length !== length) return false;
            while (length--) {
                // Deep compare each member
                key = keys[length];
                if (!(b.hasOwnProperty(key) && _eq(a[key], b[key], aStack, bStack))) return false;
            }
        }
        // Remove the first object from the stack of traversed objects.
        aStack.pop();
        bStack.pop();
        return true;
    };



}

// Simple key value store that implement the methods that the DataStore expects.
function MemoryKWStore(){
    this.removeItem = function(key){
        delete this[key];
    }
}

// The temp storeage is used on the options page to detect changes to the settings so that we can show
// the save button conditionally.  It is a duplicate of the global "Storage" store, the duplicate is modified
// when the user changes settings and then it is compared to the global storage to detect changed.
function newTempStorageDuplicate(){
    var tmpStore = new DataStore(new MemoryKWStore());
    Storage.copyInto(tmpStore);
    return tmpStore;
}
