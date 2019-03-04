

function BaseActionUtils(){


    var _this = this;

    var _selectionConverters = {
        lower: function(value){
            return value.toLowerCase();
        },
        upper: function(value){
            return value.toUpperCase();
        },
    }

    // The regular expression converter has the following syntax:
    // re:<match>:::<replacement>:::<flags>, the flags part is optional
    // eg:
    // re:\s+:::_:::g  // replaces all whitespace with underscore
    // re:\s+:::_     // replaces only the first block of whitespace with underscore
    // re:([a-z]+)\d+:::$1:::g // removes digits at the end of words in the string.
    // The $n in the replacement section is replaced with the corresponding match
    // group.
    // ::: Is used as a separator to try to minimize the chance of clashing with
    // a value the user might use in the converter expression.
    function _regexConverter(regexp, inputValue) {
        let parts = regexp.split(':::')
        if(parts.length < 2){
            return inputValue;
        }

        let re;
        if(parts.length == 2){
            re = new RegExp(parts[0]);
        }else{
            re = new RegExp(parts[0], parts[2]);
        }
        return inputValue.replace(re, parts[1]);
    }

    var _selectionEncoders = {
        '': function(selection){
            return encodeURIComponent(selection);
        },
        // Replace spaces with +
        '+': function(selection){
            return encodeURIComponent(selection).replace(/%20/g, '+');
        },
        // For some russian sites
        '(CP1251)': function(selection){
            return unicodeToWin1251_UrlEncoded(selection);
        },
        // no encoding
        '(RAW)': function(selection){
            return selection;
        },
    }

    // Replaces placeholders defined in one of the following format:
    // {%s} or with converters {%s|upper|lower}
    // {%+s} and with one or more converters {%+s|upper|lower}
    // {%(CP1251)s} and with one or more converters {%(CP1251)s|upper|lower}
    function replaceWithConverters(url, selection){
        return url.replace(/{%(.*?)s\|?(.*?)}/g, function(match, encoder, converters){

            if(!(encoder in _selectionEncoders)){
                return match;
            }

            // The character "|" has special meaning in reglar expressions. If it is going
            // to be used in an expression, a double "||" must be used as the converter separator
            // so that we don't split on the "|" in the reqular expression.
            // If the converters string start with a "|" we know that there was a double "||" because
            // of the way the replace reqular expression is defined above, in this case we use the double
            // "||" as converter separator.
            let converterNames;
            if(converters.startsWith('|')){
                converterNames = converters.substr(1).split('||');
            } else{
                converterNames = converters.split('|');
            }

            var convertedSelection = selection;
            for(var i in converterNames){

                var converterName = converterNames[i];

                if(converterName in _selectionConverters){
                    convertedSelection = _selectionConverters[converterName](convertedSelection);
                } else if(converterName.startsWith('re:')){ // Special handling for reqular expressions
                    try{
                        convertedSelection = _regexConverter(converterName.substr(3), convertedSelection);
                    } catch(err){
                        console.warn("SelectionSearch: Failed to do regexp replacement. ", err.message);
                    }
                }
            }

            return _selectionEncoders[encoder](convertedSelection);
        });
    }


    this.replaceSelection = function(url, selection){

        // This placeholder should no be used any more. Its only here because it was
        // used to wrongly fix a bug. This bug has now been fixed properly,
        // so this line is here only to not break the searches for anyone who
        // used this placeholder.
        url = url.replace(/\{%\-s\}/g, encodeURIComponent(selection));

        url = replaceWithConverters(url, selection);

        url = url.replace(/%s/g, encodeURIComponent(selection));

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
        return _this.createUrlWithOptions(engine, url);
    }

    this.createUrlWithOptions = function(engine, url){
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

