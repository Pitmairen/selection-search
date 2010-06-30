
(function(){

	

	var _keys = {
		17 : false, // Ctrl
		18 : false, // Alt
	}


	$(document).keydown(function(e){

		if(e.which in _keys)
			_keys[e.which] = true;
	});

	$(document).keyup(function(e){

		if(e.which in _keys)
			_keys[e.which] = false;
	});


	$('input:text[name],input:not([type])[name]').click(function(e){


		if(!is_activated())
			return;

		var form = $(this).parents('form').first();

		var method = form.attr('method') || 'get';

		G_ENGINE_EDITOR.show(e.pageX, e.pageY);

		if(form.length == 0 || !(method.toLowerCase() == 'get' || method.toLowerCase() == 'post') || !this.name){
			G_ENGINE_EDITOR.showError('Error parsing form');
			return;
		}

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

		var query = this_name + '=%s';
		if(params.length > 0)
			query += '&' + jQuery.param(params);

		if (method.toLowerCase() == 'post')
			url = url + '{POSTARGS}'+query;
		else
			url = urlparse.urljoin(url, '?' + query);

		var en = {
			name : location.host,
			url : url,
			post: method.toLowerCase() == 'post',
		}
		var icon = $('head link[rel="shortcut icon"]').first().attr('href');

		if (icon)
			en.icon_url = urlparse.urljoin(location.protocol + '//' + location.host + location.pathname, icon);

		G_ENGINE_EDITOR.load(en);
	});



	function is_activated(){

		for(var key in _keys){
			if(!_keys[key])
				return false;
		}
		return true;

	}
	
})();

