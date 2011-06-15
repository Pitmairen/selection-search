
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


	this.initElements = function(elms){

		_setBackgrounds(elms);
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

				var prev = _current_tr.prev();



				if(_current_tr.hasClass('menu-folder')){

					
					var elms = _current_tr.nextUntil('#end-'+_current_tr.attr('id')).andSelf().add($('#end-'+_current_tr.attr('id')));

					prev.before(elms);

					var level = prev.data('level');

					var diff = level - _current_tr.data('level');

					elms.each(function(){
						$(this).data('level', $(this).data('level') + diff);
					});
					_current_tr.data('level', level);
					
					_setBackgrounds(elms);
				}
				else{

					prev.before(_current_tr);

					_current_tr.data('level', prev.data('level'));

					_setBackgrounds(_current_tr);
				}
			}
		}else if(_prev_y < e.pageY && _current_tr.next().length > 0){
			if ((_current_tr.next().offset().top + _current_tr.next().height()/2) < e.pageY){

				if(_current_tr.hasClass('menu-folder')){

					var elms = _current_tr.nextUntil('#end-'+_current_tr.attr('id')).andSelf().add($('#end-'+_current_tr.attr('id')));

					var end = $('#end-'+_current_tr.attr('id')).next();

					if(end.length == 0)
						return;
					
					end.after(elms);

					var level = $('#end-'+_current_tr.attr('id')).next().data('level') || 0;

					var diff = level - _current_tr.data('level');
					
					elms.each(function(){
						$(this).data('level', $(this).data('level') + diff);
					});
					_current_tr.data('level', level);


					_setBackgrounds(elms);
				}
				else{

					var next = _current_tr.next();
					next.after(_current_tr);
					next = _current_tr.next();
					_current_tr.data('level', next.data('level') || 0);

					_setBackgrounds(_current_tr);
				}
			}

		}

		_prev_y = e.pageY;
	});


	function _setBackgrounds(elms){

		elms.each(function(){

			var el = $(this);
			var level = el.data('level');

			el.find('td:eq(1)').css('padding-left', (level * 16) + 'px');
			
			
			var backgrounds = [];

			for(var i = level; i >= 0; --i){

				
				if(i == level){


					var bg;

					if(el.hasClass('menu-folder')){
						backgrounds.push('url("tree-left.png") no-repeat '+((i)*16)+'px 10px');

					}

	
					if(el.hasClass('menu-folder-end'))
						bg = 'url("tree-end.png") no-repeat '+((i-1)*16)+'px center';
					else
						bg = 'url("tree.png") no-repeat '+((i-1)*16)+'px center';
					
				
					backgrounds.push(bg);
					
				}
				else{
					backgrounds.push('url("tree-left.png") no-repeat '+((i-1)*16 )+'px center');
				}

			}

			backgrounds.reverse();
			el.find('td:eq(1)').css('background', backgrounds.join(','));
			

			
		});

		
	}

}