
var Reorder = new function(){


	var _clicked_drag = false;

	var _current_tr;
	var _prev_y = null;


	this.makeMovable = function(el){
		$(el.find('.drag-target')).mousedown(function(){
			_clicked_drag = true;

			_current_tr = $(this).parent();

			_current_tr.addClass('drag-moving');

			return false;

		});
	}


	$(document).mouseup(function(){

		if(_clicked_drag){
			_current_tr.removeClass('drag-moving');
		}

		_clicked_drag = false;

	});

	$(document).mousemove(function(e){

		if(!_clicked_drag)
			return;

		if (_prev_y == null){
			_prev_y = e.pageY;
			return;
		}

		if(_prev_y > e.pageY && _current_tr.prev().length > 0 && !_current_tr.prev().hasClass('drag-stop')){
			if ((_current_tr.prev().offset().top + _current_tr.prev().height()/2) > e.pageY){
				_current_tr.prev().before(_current_tr);
			}
		}else if(_prev_y < e.pageY && _current_tr.next().length > 0){
			if ((_current_tr.next().offset().top + _current_tr.next().height()/2) < e.pageY){
				_current_tr.next().after(_current_tr);
			}
		}

		_prev_y = e.pageY;
	});
}