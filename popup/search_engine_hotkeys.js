
function SearchEngineHotKeys(searchEngines, options, utils){

    var selectionUtil = new SelectionUtil(options);

    var _currentCombo = []; // Keybard Combo
    var _hasSelection = false;
    var _comboMap = {};

    document.addEventListener('selectionchange', function() {
        _hasSelection = selectionUtil.hasSelection();
        if(!_hasSelection){
            _resetkeys();
        }
    });

    document.addEventListener('keydown', function(e){

        if(!_hasSelection || (!options.show_in_inputs && EventUtils.eventInInputElement(e))){
            return;
        }

        if(_currentCombo.indexOf(e.which) == -1){
            _currentCombo.push(e.which);
            _checkHotkey();
        }
    });

    document.addEventListener('keyup', function(e){

        if(!_hasSelection){
            return;
        }

        var index = _currentCombo.indexOf(e.which);

        if(index != -1){
            _currentCombo.splice(index, 1);
        }

    });

    // Ensure combo is not marked as activated on page return
    window.addEventListener('blur', _resetkeys);

    function _resetkeys(){
        _currentCombo = [];
    }

    function _checkHotkey(){
        var currentIdentifier = _createHotKeyIdentifier(_currentCombo);
        if(_comboMap.hasOwnProperty(currentIdentifier)){
            _comboMap[currentIdentifier]();
        }
    }

    function _createHotKeyIdentifier(combo){
        return combo.slice().sort(function(a, b){
            return a - b;
        }).join('-');
    }


    function _addEngineHotKeys(engines){
        for(var i=0; i < engines.length; i++){
            _addEngineHotKey(engines[i]);
        }
    }

    function _addEngineHotKey(engine){

        if(engine.hotkey){
            _comboMap[_createHotKeyIdentifier(engine.hotkey)] = function(){
                _onEngineHotKey(engine)
            }
        }

        if(engine.is_submenu && engine.engines){
            _addEngineHotKeys(engine.engines);
        }
    }

    function _onEngineHotKey(engine){

        if(engine.is_submenu && engine.openall){
            utils.openAllInSubmenu(engine, selectionUtil.getSelection());
            _clickSubmenu(engine);
            return;
        }

        utils.openEngine(engine, selectionUtil.getSelection());
    }


    _addEngineHotKeys(searchEngines);
}
