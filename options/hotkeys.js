
var HotKeys = new function(){

	var _specialKeys = {
			8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
			20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
			37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del",
			96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
			104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/",
			112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8",
			120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 191: "/", 224: "meta",
			91: "win", 92 : "win", 0: "space", 188: ",", 190: ".", 189: "-",
		};


	var _that = this;

	this.getName = function(code){

		if (code in _specialKeys)
			return _specialKeys[code];

		return String.fromCharCode(code).toLowerCase();
	}


	this.createHotkeyInput = function(_selector, _default){

		return new HotkeyEditor($(_selector), _default);

	}

	this.createHotkeyInputForElement = function(_element, _default){

		return new HotkeyEditor(_element, _default);

	}


	function HotkeyEditor(_input, _default_combo){


		var _restart = false;
		var _keys = {}
		var _key_combo = [];
		var _last_combo = [];
		var _this = this;


		this.getCombo = function(){

			if(_last_combo.length == 0)
				return _default_combo.slice();
			return _last_combo.slice();
		}

		this.clearCombo = function(){
			_last_combo = [];
			_default_combo = [];
			update_input();
		}

		function get_combo_name(){

			if(_last_combo.length == 0)
				return _default_combo.map(HotKeys.getName).join('+');
			return _last_combo.map(HotKeys.getName).join('+');
		}


		function update_input(){
			_input.val(get_combo_name());
			_input.data('hotkey', _this.getCombo());
		}

		update_input();

		_input.focus(function(){
			_restart = false;
			$(this).val('');
			_keys = {};
			_key_combo = [];

		});

		_input.blur(function(){
			update_input();
		});


		_input.keydown(function(e){

			if(_restart || _key_combo.length == 0){
				_keys = {}
				_key_combo = [];
				_last_combo = [];
			}

			if(e.which in _keys){
				return false;
			}

			_restart = false;

			_keys[e.which] = 1;
			_key_combo.push(e.which);


			_last_combo = _key_combo.slice();
			$(this).val(get_combo_name());

			e.preventDefault();
			return false;
		});

		_input.keyup(function(e){

			update_input();
			$(this).trigger('input');

			if(_key_combo.indexOf(e.which) == _key_combo.length-1){

				_key_combo.pop();

				delete _keys[e.which];
			}
			else
				_restart = true;

		});


	}


};
