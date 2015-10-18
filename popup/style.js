
function Style(shadowDOM){


    // Which corner of the submenu to place at which corner
    // of the submenu-link defined by the "submenu_position"
    // config option. See icons only style for example.
    
    var _defaultStyleConfig = {
        "submenu_corner" : "topleft", 
        "submenu_position" : "topright",
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

    }

}

