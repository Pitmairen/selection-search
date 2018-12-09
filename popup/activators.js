

function Activator(_options){

    var _inCombo = false;
    var _this = this;
    var _selectionUtil = new SelectionUtil(_options);

    this.setInCombo = function(in_combo){
        _inCombo = in_combo;
    }

    this.getSelectionRect = function(){
        return _selectionUtil.getSelectionRect();
    }

    this.getSelection = function(){
        return _selectionUtil.getSelection();
    }

    this.hasSelection = function(){
        return _selectionUtil.hasSelection();
    }

    this.isPointOnSelection = function(x, y){
        return _selectionUtil.isPointOnSelection(x, y);
    }

    this.isInCombo = function(){
        return _inCombo;
    }


    // Returns true if the popup should be opened.
    // "e" is the event that created the request to open the popup.
    this.popupShouldOpen = function(e){
        return _this.hasSelection();
    }


    this.preventClickOnLinks = function(){

        // Prevent default action when selection is on on links
        for (var links = document.querySelectorAll("a"), i = 0; i < links.length; i++){

            links[i].addEventListener('click', _disableEvent);
            links[i].addEventListener('mouseup', _disableEvent);

        }
    }


    function _disableEvent(e){

        if(!_this.popupShouldOpen(e))
            return;

        if(_this.isPointOnSelection(e.pageX, e.pageY)){
            e.preventDefault();
            e.stopPropagation();
        }

    }
}



ClickActivator.prototype = Object.create(Activator);

function ClickActivator(_popup, _options){

    Activator.call(this, _options);

    var _doubleClickTime = 0;
    var _this = this;


    // Returns true if the popup should be opened.
    this.popupShouldOpen = function(e){
        return _this.hasSelection() && e.button == _options.button;
    }


    this.setup = function(){


        _this.preventClickOnLinks();


        document.addEventListener("mousedown", function(e){

            if(!_this.isInCombo() && _popup.isActive()){
                _popup.hide();
                return;
            }

            var in_input = false;
            if(EventUtils.eventInInputElement(e)){
                if(!e.ctrlKey || !_options.show_in_inputs)
                    return;
                in_input = true;
            }


            if (!_this.hasSelection() || e.button != _options.button)
                return;


            // we don't want to prevent tripleclick selection
            if(e.button == 0 && e.timeStamp - _doubleClickTime < 150)
                return;


            if(in_input || _this.isPointOnSelection(e.pageX, e.pageY)){

                var sel = _this.getSelection();
                _popup.setSelection(sel)

                _popup.show(e.pageX, e.pageY);

                e.preventDefault();
                e.stopPropagation();
            }

        });


        document.addEventListener("dblclick", function(e){
            if (e.button == 0){
                _doubleClickTime = e.timeStamp;
            }
        });

    }

}


DoubleClickActivator.prototype = Object.create(Activator);

function DoubleClickActivator(_popup, _options){

    Activator.call(this, _options);

    var _doubleTimer = null;

    var _this = this;

    this.setup = function(){

        document.addEventListener('mousedown', function(e){
            if(_doubleTimer != null){
                clearTimeout(_doubleTimer);
            }
            // The popup should not be hidden here, as it causes the popup to be erroneously hidden
            // on click when the double click activator is combined with the click activator.
            // Currently we don't have to hide the popup here, as the double click activator
            // is enabled independently from the other activators, and one of the other activators
            // will always be active, and the other activators will hide the menu on mouse down if it is
            // visible.
        });


        document.addEventListener('dblclick', function(e){

            _doubleTimer = setTimeout(function(){

                _doubleTimer = null;

                if (!_this.hasSelection())
                    return;

                var sel = _this.getSelection();
                _popup.setSelection(sel)
                _popup.show(e.pageX, e.pageY);

                e.stopPropagation();
                e.preventDefault();

            }, 100);

        });
    }




}





AutoActivator.prototype = Object.create(Activator);

function AutoActivator(_popup, _button, _options){

    Activator.call(this, _options);

    var _lastTimer;
    var _startedInInput = false;
    var _this = this;

    this.setup = function(){

        document.addEventListener('mousedown', function(e){


            if(_lastTimer != undefined)
                window.clearTimeout(_lastTimer);

            _startedInInput = false;

            if(_button.isActive())
                _button.hide();

            if(!_this.isInCombo() && _popup.isActive()){
                _popup.hide();
            }

            if(EventUtils.eventInInputElement(e)){
                _startedInInput = true;
                if(!e.ctrlKey || !_options.show_in_inputs || _options.auto_popup_in_inputs)
                    return;

                if(_this.hasSelection() && e.button == 0){

                    var sel = _this.getSelection();
                    _popup.setSelection(sel)
                    _popup.show(e.pageX, e.pageY);

                    e.stopPropagation();
                    e.preventDefault();

                }
            }

        });

        document.addEventListener('mouseup', function(e){

            if(_startedInInput && (!_options.show_in_inputs || !_options.auto_popup_in_inputs))
                return;

            if(e.button != 0 || _popup.isActive())
                return;

            if (_this.hasSelection()){

                if(_lastTimer != undefined)
                    window.clearTimeout(_lastTimer);

                _lastTimer = window.setTimeout(
                    _tryShow,
                    _options.auto_open_delay,
                    e,
                    _options.auto_popup_relative_to_mouse || (_startedInInput && _options.auto_popup_in_inputs)
                );
            }
        });

    }

    function _tryShow(e, relative_to_mouse){
        if (_this.hasSelection() && !_popup.isActive()){

            var sel = _this.getSelection();
            _popup.setSelection(sel);

            var rect = _this.getSelectionRect();

            var x,y;

            if (_options.auto_popup_show_menu_directly){
                x = e.pageX;
                y = e.pageY;

                _popup.show(x, y);
            }else{
                var dimensions = Positioning.enableDimensions(_button.getNode());

                if (relative_to_mouse){
                    x = e.pageX + _button.getNode().clientWidth + 5;
                    y = e.pageY - _button.getNode().clientHeight - 15;
                }else{
                    x = window.pageXOffset + rect.right;
                    y = window.pageYOffset + rect.top - _button.getNode().clientHeight - 10;
                }

                dimensions.restore();

                _button.show(x, y);
            }

            _lastTimer = undefined;

        }
    }
}





KeyAndMouseActivator.prototype = Object.create(Activator);

function KeyAndMouseActivator(_popup, _options){


    Activator.call(this, _options);

    var _keys = {}; // Keybard Combo
    var _mouseButton = 0;
    var _this = this;


    this.popupShouldOpen = function(e){
        return _this.hasSelection() && _is_keyboard_combo_activated() && e.button == _options.button;
    }


    this.setup = function(){

        var combo = _options.k_and_m_combo;
        var e = combo.length - 1;
        for(var i=0; i<e; ++i){
            _keys[combo[i]] = false;
        }

        _mouseButton = combo[combo.length-1];


        _this.preventClickOnLinks();


        // Disable context menu if right click is used
        if(_mouseButton == 2){

            document.addEventListener('contextmenu', function (e){
                if (_this.hasSelection() && _is_keyboard_combo_activated() && _mouseButton == e.button){
                    e.preventDefault();
                    e.stopPropagation();
                }
            });

        }
        document.addEventListener('keydown', function(e){
            if(e.which in _keys)
                _keys[e.which] = true;
        });

        document.addEventListener('keyup', function(e){
            if(e.which in _keys)
                _keys[e.which] = false;
        });


        document.addEventListener('mousedown', function(e){

            if(!_this.isInCombo() && _popup.isActive()){
                _popup.hide();
                // _resetkeys();
                return;
            }


            if (!_this.hasSelection() || !_is_keyboard_combo_activated() || _mouseButton != e.button)
                return;

            var sel = _this.getSelection();
            _popup.setSelection(sel)
            _popup.show(e.pageX, e.pageY);

            e.stopPropagation();
            e.preventDefault();

        });

        // Ensure combo is not marked as activated on page return
        window.addEventListener('blur', _resetkeys);

    }

    function _resetkeys(){
        for (key in _keys){
            _keys[key] = false;
        }

    }

    function _is_keyboard_combo_activated(){

        for (key in _keys){
            if(!_keys[key])
                return false;
        }
        return true;

    }

}


function ComboActivator(_popup, _activators){



    this.setup = function(){

        document.addEventListener('mousedown', function(e){

            if(_popup.isActive()){
                _popup.hide();
            }

        });

        for(var i in _activators){
            _activators[i].setInCombo(true);
            _activators[i].setup();
        }


    }

}


