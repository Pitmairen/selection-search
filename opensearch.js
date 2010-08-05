

var OpenSearch = {

	_req : null,

	cancelReq : function(){

		if(OpenSearch._req && OpenSearch._req.readyState != 0)
			OpenSearch._req.abort();
	},
	
	getEngineFromURL : function (url, callback){

		OpenSearch.cancelReq();

		OpenSearch._req = $.ajax({
			url : url,

			dataType: "xml",

			success: function(data, status){
				var ret = OpenSearch.getEngineFromXML(data);
				if(ret.status == 'OK')
					callback('OK', ret.engine);
				else
					callback('ERROR', null, ret.msg);
			},

			error: function(req, err){
				callback('ERROR', err);
			}
		});

	},


	/* parses only GET searches */
	getEngineFromXML : function (xml){

		var ret = {'status' : 'ERROR', 'msg' : 'Error parsing opensearch document'}
		
		var name = $(xml).find('ShortName').first().text();

		var _url = $(xml).find('Url[type=text/html]').first();

		if(_url.length == 0){
			ret['msg'] = 'Unsupported url mimetype';
			return ret;
		}

		var template = _url.attr('template') || _url.text(); // opensearch 1.0 version

		if(template && name){

			var method = _url.attr('method').toLowerCase() || 'get';

			if(method == 'post'){

				var _params = [];
				_url.find('Param').each(function(){
					
					_params.push($(this).attr('name') + '=' + $(this).attr('value'))
				});
				_params = _params.join('&');

				template += '!POSTARGS!' + _params; // We call it !POSTARGS! here to prevent it to be replaced by the generic regexp below.
				template += '!POSTENCODING!' + ($(xml).find('InputEncoding').first().text() || 'UTF-8');

			}


			var url = template.replace(/{searchTerms}/g, '%s');

			url = url.replace('{startPage?}', '');

			url = url.replace('{startIndex}', _url.attr('indexOffset') || 1);
			url = url.replace('{startPage}', _url.attr('pageOffset') || 1);

			url = url.replace(/{.*?}/g, '');

			// Replace to real POSTARGS and POSTENCODING
			url = url.replace('!POSTARGS!', '{POSTARGS}');
			url = url.replace('!POSTENCODING!', '{POSTENCODING}');

			var img = $(xml).find('Image[height=16][width=16]').first();
			if(img.length == 0)
				img = $(xml).find('Image').first();

			var en = {"name": name, "url" : url}

			if(img.length != 0 && img.text().substr(0, 4) == 'http'){
				en['icon_url'] = img.text();
			}

			if(method == 'post')
				en.post = true;

			ret['status'] = 'OK';
			ret['engine'] = en;

		}

		return ret;
	}
};