
ContextMenuActionUtils.prototype = Object.create(BaseActionUtils);

function ContextMenuActionUtils(info, tab){

    BaseActionUtils.call(this);

    _urlVariables =  [];

    var _urlParts = {};
    var _this = this;

    if(info.pageUrl){
        _addVariables(info.pageUrl);
    }


    this.openAllUrls = function(engine, urls, selection){

        openAllUrls({
            action:'openAllUrls', urls: urls, "selection" : selection,
            "in_background_tab" : engine.background_tab},
            function(){}, // Dummy
            tab
        );

    }

    this.replaceVariables = function(url){

        for(var i in _urlVariables){
            url = url.replace(_urlVariables[i][0], _urlVariables[i][1]);
        }

        if(info.pageUrl && url.match(/%PAGE_QS_VAR\(.+?\)/)){
            url = _this.replaceQueryStringVars(url, _urlParts.query);
        }

        return url;
    }


    function _addVariables(pageUrl){

        var urlParts = urlparse.urlsplit(pageUrl);

        var host = urlParts.hostname;
        if(urlParts.port){
            host += ":" + urlParts.port;
        }

        var origin = urlParts.scheme + "://" + host;

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



