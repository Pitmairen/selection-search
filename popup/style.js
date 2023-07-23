
function Style(shadowDOM){


    // The key "submenu_corner" defines which corner of the submenu to place at
    // which corner of the submenu-link defined by the "submenu_position"
    // config option. See icons only style for example.
    //
    // The keys "menu_edge_*" and "button_edge_*", where "*" is "right",
    // "bottom", "left", or "top", designate how the button or menu should be
    // repositioned if they fall outside of the window. If one of these keys
    // has a value of "auto", then the corresponding element is automatically
    // repositioned to fit inside the browser window. If one of these keys has
    // an integer value such as "10px", then the element is moved that amount
    // (only by pixels) in the corresponding direction, without any automatic
    // positioning done beforehand.

    var _defaultStyleConfig = {
        "submenu_corner" : "topleft",
        "submenu_position" : "topright",
        "menu_edge_right" : "auto",
        "menu_edge_bottom" : "auto",
        "menu_edge_left" : "auto",
        "menu_edge_top" : "auto",
        "button_edge_right" : "auto",
        "button_edge_bottom" : "auto",
        "button_edge_left" : "auto",
        "button_edge_top" : "auto",
    };
    var _styleConfig = {};

    var _defaultStyleNode = document.createElement('style');
    var _circularStyleNode = document.createElement('style');
    var _customStyleNode = document.createElement('style');


    // FIREFOX-BUG?: In firefox, depending on a sites Content Security Policy header, some
    // content must be set strings before appending to the dom,
    // or else firefox logs warnings about blocked inline content. Tested on archlinux.org.
    // Previously empty strings was used, but this crashed https://familylink.google.com/,
    // but adding ";" instead of empty strings seems to fix this.
    _defaultStyleNode.textContent = ';';
    _circularStyleNode.textContent = ';';
    _customStyleNode.textContent = ';';

    shadowDOM.appendChild(_defaultStyleNode);
    shadowDOM.appendChild(_circularStyleNode);
    shadowDOM.appendChild(_customStyleNode);


    this.setDefaultStyle = function(style){
        // FIREFOX-BUG?: Depending on a sites Content Security Policy, the old method 
        // of appending a text node is blocked, setting the textContent works.
        _defaultStyleNode.textContent = style;
    }

    this.setCustomStyle = function(style){
        _resetCustomStyle();
        _customStyleNode.textContent = style;
        _styleConfig = {};
        _parseStyleOptions(style);
    }

    this.setCircularStyle = function(style){
        _resetCircularStyle();
        _circularStyleNode.textContent = style;
    }

    this.getConfigValue = function(key){

        if (_styleConfig.hasOwnProperty(key))
            return _styleConfig[key];
        else
            return _defaultStyleConfig[key];

    }

    function _resetCustomStyle(){
        while (_customStyleNode.hasChildNodes()) {
            _customStyleNode.removeChild(_customStyleNode.lastChild);
        }
    }

    function _resetCircularStyle(){
        while (_circularStyleNode.hasChildNodes()) {
            _circularStyleNode.removeChild(_circularStyleNode.lastChild);
        }

    }


    /* This searches for a inline config section in the css data */
    function _parseStyleOptions(css){

        var match = css.match(/\/*CONFIG_START{([\s\S]*)}CONFIG_END\*\//);
        if(!match)
            return;

        var config = '{' + match[1] + '}';

        try{
            var config = JSON.parse(config);
        }catch(err){
            return;
        }

        if(config.hasOwnProperty('submenu_corner') &&
            config['submenu_corner'].match(/^(top|bottom)(right|left)$/)){

            _styleConfig['submenu_corner'] = config['submenu_corner'];
        }

        if(config.hasOwnProperty('submenu_position') &&
            config['submenu_position'].match(/^(top|bottom)(right|left)$/)){

            _styleConfig['submenu_position'] = config['submenu_position'];

        }

        var edge_properties = ['menu_edge_right', 'menu_edge_bottom',
                               'menu_edge_left', 'menu_edge_top',
                               'button_edge_right', 'button_edge_bottom',
                               'button_edge_left', 'button_edge_top'];

        for(var i in edge_properties){
            var prop = edge_properties[i];
            if(config.hasOwnProperty(prop) &&
               config[prop].match(/^[-+]?(0|[1-9][0-9]*) *(px)?$/)){
                _styleConfig[prop] = config[prop];
            }
        }

    }

}

