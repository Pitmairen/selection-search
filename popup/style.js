
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
    // a numeric pixel value such as "10px", then the element is moved that
    // numerical amount in the corresponding direction, without any automatic
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

    shadowDOM.appendChild(_defaultStyleNode);
    shadowDOM.appendChild(_circularStyleNode);
    shadowDOM.appendChild(_customStyleNode);


    this.setDefaultStyle = function(style){
        _defaultStyleNode.appendChild(document.createTextNode(style));
    }

    this.setCustomStyle = function(style){
        _resetCustomStyle();
        _customStyleNode.appendChild(document.createTextNode(style));
        _styleConfig = {};
        _parseStyleOptions(style);
    }

    this.setCircularStyle = function(style){
        _resetCircularStyle();
        _circularStyleNode.appendChild(document.createTextNode(style));
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

        if(config.hasOwnProperty('menu_edge_right') &&
            config['menu_edge_right'].match(/^ *[+-]?((\d+(\.\d*)?)|(\.\d+)) *(px)? *$/)){

            _styleConfig['menu_edge_right'] = config['menu_edge_right'];
        }

        if(config.hasOwnProperty('menu_edge_bottom') &&
            config['menu_edge_bottom'].match(/^ *[+-]?((\d+(\.\d*)?)|(\.\d+)) *(px)? *$/)){

            _styleConfig['menu_edge_bottom'] = config['menu_edge_bottom'];
        }

        if(config.hasOwnProperty('menu_edge_left') &&
            config['menu_edge_left'].match(/^ *[+-]?((\d+(\.\d*)?)|(\.\d+)) *(px)? *$/)){

            _styleConfig['menu_edge_left'] = config['menu_edge_left'];
        }

        if(config.hasOwnProperty('menu_edge_top') &&
            config['menu_edge_top'].match(/^ *[+-]?((\d+(\.\d*)?)|(\.\d+)) *(px)? *$/)){

            _styleConfig['menu_edge_top'] = config['menu_edge_top'];
        }

        if(config.hasOwnProperty('button_edge_right') &&
            config['button_edge_right'].match(/^ *[+-]?((\d+(\.\d*)?)|(\.\d+)) *(px)? *$/)){

            _styleConfig['button_edge_right'] = config['button_edge_right'];
        }

        if(config.hasOwnProperty('button_edge_bottom') &&
            config['button_edge_bottom'].match(/^ *[+-]?((\d+(\.\d*)?)|(\.\d+)) *(px)? *$/)){

            _styleConfig['button_edge_bottom'] = config['button_edge_bottom'];
        }

        if(config.hasOwnProperty('button_edge_left') &&
            config['button_edge_left'].match(/^ *[+-]?((\d+(\.\d*)?)|(\.\d+)) *(px)? *$/)){

            _styleConfig['button_edge_left'] = config['button_edge_left'];
        }

        if(config.hasOwnProperty('button_edge_top') &&
            config['button_edge_top'].match(/^ *[+-]?((\d+(\.\d*)?)|(\.\d+)) *(px)? *$/)){

            _styleConfig['button_edge_top'] = config['button_edge_top'];
        }

    }

}

