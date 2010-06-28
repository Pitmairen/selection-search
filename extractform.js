
(function(){

	

	var _keys = {
		17 : false, // Ctrl
		18 : false, // Alt
	}

	var _activated = false;

	
	$(document).keydown(function(e){

		if(e.which in _keys)
			_keys[e.which] = true;
	});

	$(document).keyup(function(e){

		if(e.which in _keys)
			_keys[e.which] = false;
	});


	$('input:text[name],input:not([type])[name]').click(function(){


		if(!is_activated())
			return;

		var form = $(this).parents('form').first();

		var method = form.attr('method') || 'get';

		if(form.length == 0 || method.toLowerCase() != 'get' || !this.name)
			return;


		var action = form.attr('action') || '';

		var url = location.protocol + '//' + location.host + location.pathname;
		url = urlparse.urljoin(url, action);

		var this_name = this.name;

		var params = jQuery.map(form.serializeArray(), function(q, i){
			if(q.name == this_name){
				return null;
			}
			return q;
		});

		var query = '?' + this_name + '=%s';
		if(params.length > 0)
			query += '&' + jQuery.param(params);

	
		console.log(url + query);

		var icon = $('head link[rel="shortcut icon"]').first().attr('href');

		if (icon)
			console.log(urlparse.urljoin(location.protocol + '//' + location.host + location.pathname, icon));

		
	});



	function is_activated(){

		for(var key in _keys){
			if(!_keys[key])
				return false;
		}
		return true;

	}
	
})();

