
$(document).ready(function (){

	var query = document.location.search.substr(1).split('=');

	if(query.length != 2){
		$("#error").text('Search failed. Invalid url.');
		return;
	}

	if(query[0] != 'url'){
		$("#error").text('Search failed. Invalid url.');
		return;
	}

	var url = decodeURIComponent(query[1]);

	var parts = url.split('{SPECIALENCODING}', 2);
	var encoding = null;

	if(parts.length == 2){
		url = parts[0];
		encoding = parts[1];
	}

	$("#url").text(url);

	parts = url.split('?', 2);

	var form = $('<form></form>')
		.attr('method', 'get')
		.attr('action', parts[0])

    $(document.body).append(form);

	if(encoding){
		form.attr('accept-charset', encoding);
	}

	if (parts.length > 1){
		var query = parts[1].split('&');

		for(var i=0; i<query.length; ++i){
			var key_value = query[i].split('=', 2);
			if(key_value.length != 2)
				continue;
			form.append($('<input type="hidden" name="'+decodeURIComponent(key_value[0])+'" value="'+decodeURIComponent(key_value[1])+'" />'));
		}
	}

	form.submit();

});

