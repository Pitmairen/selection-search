

function BaseActionUtils(){


    var _this = this;


    this.replaceSelection = function(url, selection){

    	url = url.replace(/%s/g, encodeURIComponent(selection));

        url = url.replace(/\{%\+s\}/g, encodeURIComponent(selection).replace(
				/%20/g, '+'));

        // This placeholder should no be used any more. Its only here because it was 
        // used to wrongly fix a bug. This bug has now been fixed properly,
        // so this line is here only to not break the searches for anyone who 
        // used this placeholder.
        url = url.replace(/\{%\-s\}/g, encodeURIComponent(selection));

        if(url.indexOf('{%(CP1251)s}') !== -1){
            url = url.replace(/\{%\(CP1251\)s\}/g, unicodeToWin1251_UrlEncoded(selection));
        }
    
        return url;
    }


    this.replaceVariables = function(url){

        return url;
    }

    this.copyToClipboard = function(selection){

        chrome.runtime.sendMessage({
            action:'copyToClipboard', text: selection,
        });

    }


    this.openAllUrls = function(engine, urls, selection){

        chrome.runtime.sendMessage({
            action:'openAllUrls', urls: urls, "selection" : selection,
            "in_background_tab" : engine.background_tab,
        });

    }
    
    this.openAllUrlsWithOptions = function(engine, urlsWithOptions, selection){

        chrome.runtime.sendMessage({
            action:'openAllUrls', urlsWithOptions: urlsWithOptions, "selection" : selection,
            "in_background_tab" : engine.background_tab,
        });

    }

    this.openEngine = function(engine, selection){

        var urls = [_this.createSearchUrlWithOptions(engine, selection)];

        _this.openAllUrlsWithOptions(engine, urls, selection);

    }

    this.openAllInSubmenu = function(engine, selection){

        var urls = _getAllUrlsWithOptions(engine.engines, selection, []);

        _this.openAllUrlsWithOptions(engine, urls, selection);

    }


    this.createSearchUrl = function(engine, selection){

        var url = _this.replaceSelection(engine.url, selection);
        url = _this.replaceVariables(url);

        if(engine.post === true)
            return _this.createPostUrl(url, selection);
        
        return url;
    }

    this.createPostUrl = function(url, selection){

        return chrome.extension.getURL('old/postsearch.html') + '?url='+encodeURIComponent(url);
    }


    this.createSearchUrlWithOptions = function(engine, selection){
        var url = _this.createSearchUrl(engine, selection);
        return {url: url, incognito: engine.open_in_incognito};
    }



    this.replaceQueryStringVars = function(url, qs){

		var qs_map = {}
		if(qs.length !== 0){
            var qs_parts = qs.split('&');
            for(var i in qs_parts){
				var qs_var = qs_parts[i].split('=');
				if (qs_var.length == 2){
					qs_map[qs_var[0]] = qs_var[1];
				}
		    }
        }

		url = url.replace(/%PAGE_QS_VAR\((.+?)\)/g, function(m, qs_key){
			if (qs_key in qs_map){
				if(qs_map[qs_key].substr(0, 11) === 'javascript:')
					return '';
				return encodeURIComponent(qs_map[qs_key]);
			}
			return '';
		});

		return url;
	}


    /*
     * Recursively get all the urls from the engines.
     */
    function _getAllUrls(engines, selection, urls){
        for(var i in engines){
            var engine = engines[i];
            if(engine.is_submenu)
                urls = _getAllUrls(engine.engines, selection, urls);
            else
                urls.push(_this.createSearchUrl(engine, selection));
        }
        return urls;

    }

    /*
     * Recursively get all the urls from the engines.
     */
    function _getAllUrlsWithOptions(engines, selection, urls){
        for(var i in engines){
            var engine = engines[i];
            if(engine.is_submenu)
                urls = _getAllUrlsWithOptions(engine.engines, selection, urls);
            else
                urls.push(_this.createSearchUrlWithOptions(engine, selection));
        }
        return urls;

    }
}

