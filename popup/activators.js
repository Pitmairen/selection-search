

function Activator(){

    var _inCombo = false;
    var _this = this;

    this.setInCombo = function(in_combo){
        _inCombo = in_combo;
    }

    this.getSelectionRect = function(){
        var range = window.getSelection().getRangeAt(0);
        if(range){

            return range.getBoundingClientRect();

        }
        return undefined;
    }

    this.getSelection = function(){
        return window.getSelection().toString().trim();
    }

    this.hasSelection = function(){

        var sel = this.getSelection();

        if (sel.length == 0)
            return false;

        return true;
        return sel.indexOf("\n") == -1;
    }


    this.isPointOnSelection = function(x, y){

        var rx = window.pageXOffset;
        var ry = window.pageYOffset;

        var rect = this.getSelectionRect();

        if(rect){
            rx += rect.left;
            ry += rect.top;
        }

        if ((y >= ry && y <= ry + rect.height && x >= rx && x <= rx + rect.width)){
            return true;
        }
        return false;

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

    Activator.call(this);

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
			if(e.target.nodeName in {'INPUT':1, 'TEXTAREA':1}){
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

function DoubleClickActivator(_popup){

    Activator.call(this);

	var _doubleTimer = null;

    var _this = this;

	this.setup = function(){

		document.addEventListener('mousedown', function(e){
			if(_doubleTimer != null)
				clearTimeout(_doubleTimer);
            else if(_popup.isActive())
                _popup.hide();
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

    Activator.call(this);

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

			if(e.target.nodeName in {'INPUT':1, 'TEXTAREA':1}){
				_startedInInput = true;
				if(!e.ctrlKey || !_options.show_in_inputs)
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

			if(_startedInInput)
				return;

			if(e.button != 0 || _popup.isActive())
				return;

			if (_this.hasSelection()){
				if(_lastTimer != undefined)
					window.clearTimeout(_lastTimer);
				_lastTimer = window.setTimeout(_tryShow, 300, e);
			}
		});

	}

	function _tryShow(e){
		if (_this.hasSelection() && !_popup.isActive()){

			var sel = _this.getSelection();
			_popup.setSelection(sel);

			var rect = _this.getSelectionRect();

			var x = window.pageXOffset + rect.right;
			var y = window.pageYOffset + rect.top - _button.getNode().clientHeight - 30;

			_button.show(x, y);

			_lastTimer = undefined;

		}
	}
}





KeyAndMouseActivator.prototype = Object.create(Activator);

function KeyAndMouseActivator(_popup, _options){


    Activator.call(this);

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


