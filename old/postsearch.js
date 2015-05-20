
$(document).ready(function (){


	var query = document.location.search.substr(1).split('=');

	if(query.length != 2){
		$("#error").text('Search failed');
		return;
	}

	if(query[0] != 'url'){
		$("#error").text('Search failed');
		return;
	}


	var url = decodeURIComponent(query[1]);

	var parts = url.split('{POSTENCODING}', 2);
	var encoding = null;

	if(parts.length == 2){
		url = parts[0];
		encoding = parts[1];
	}

	parts = url.split('{POSTARGS}', 2);

	if(parts.length != 2){
		$("#error").text('Invalid url for a POST search. The url must contain "{POSTARGS}"');
		return;
	}

	var form = $('<form></form>')
		.attr('method', 'post')
		.attr('action', parts[0])

	if(encoding){
		form.attr('accept-charset', encoding);
	}

	var query = parts[1].split('&');

	for(var i=0; i<query.length; ++i){
		var key_value = query[i].split('=', 2);
		if(key_value.length != 2)
			continue;
		form.append($('<input type="hidden" name="'+key_value[0]+'" value="'+key_value[1]+'" />'));
	}


// 	$("#error").text('Invalid url for a POST search. The url must contain "{POSTARGS}"');
	form.submit();


});

