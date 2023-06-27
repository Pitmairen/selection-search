
ToolbarMenuActionUtils.prototype = Object.create(BaseActionUtils);

function ToolbarMenuActionUtils(){

    BaseActionUtils.call(this);

    _urlVariables =  [];

    var _url = undefined;
    var _urlParts = {};
    var _this = this;



    var parentReplaceSelection = repl = this.replaceSelection;

    this.replaceSelection = function(url, selection){
        if(url === '%s'){
            return replaceDomainSelection(selection);
        }
        return parentReplaceSelection(url, selection);
    }

    this.replaceVariables = function(url){

        for(var i in _urlVariables){
            url = url.replace(_urlVariables[i][0], _urlVariables[i][1]);
        }

        if (_url !== undefined && (url.match(/%PAGE_QS_VAR\(.+?\)/)
            || url.match(/%PAGE_QS_VAR_NO_ENCODING\(.+?\)/))) {
            url = _this.replaceQueryStringVars(url, _urlParts.query);
        }

        return url;
    }

    this.addVariables = function(pageUrl){

        _url = pageUrl;

        var urlParts = urlparse.urlsplit(pageUrl);

        var host = urlParts.hostname;
        if(urlParts.port){
            host += ":" + urlParts.port;
        }

        var origin = urlParts.scheme + "://" + host;

        _urlVariables.push([/%PAGE_ORIGIN_NO_ENCODING/g, origin]); // no urlencoding

        _urlVariables.push([/%PAGE_HOST/g, encodeURIComponent(host)]);
        _urlVariables.push([/%PAGE_URL/g, encodeURIComponent(pageUrl)]);
        _urlVariables.push([/%PAGE_ORIGIN/g, encodeURIComponent(origin)]);

        if(urlParts.query.substr(0, 12) == 'javascript:')
            _urlVariables.push([/%PAGE_QUERY_STRING/g, '']);
        else
            _urlVariables.push([/%PAGE_QUERY_STRING/g, encodeURIComponent(urlParts.query)]);

        _urlParts = urlParts;
    }
}


