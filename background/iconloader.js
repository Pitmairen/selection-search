

function IconLoader(src, onload){

    var _img = new Image();

    _img.addEventListener("error", _onError);

    if(onload !== undefined){
        _img.addEventListener("load", _onLoad);
    }

    _img.src = src;

    var _this = this;

    var _urlCache = null;
    var _isError = false;

    _img.addEventListener("load", function(){
        _isError = false;
    });

    this.isComplete = function(){
        return _img.complete || _isError;
    }

    this.getDataURL = function(){
        if(_urlCache !== null)
            return _urlCache;

        if(_isError){
            _reloadImage();
            return IconLoader.getDefaultIcon();
        }

        IconLoader._context.clearRect(0, 0, 16, 16);
        IconLoader._context.drawImage(_img, 0, 0, 16, 16);
        _urlCache = IconLoader._canvas.toDataURL("image/png");
        return _urlCache;
    }


    function _onError(e){
        _isError = true;        
    }

    function _onLoad(e){
        onload(_this);
    }

    function _reloadImage(){
        _img.src = src + "#" + new Date().getTime();
    }
}


IconLoader.loadCurrentDomainIcon = function(tab, onload){

    var url = IconLoader.getDefaultIcon();

    if(tab !== undefined && tab.url){
        url = IconLoader.getFaviconUrl(tab.url.split('/').slice(0, 3).join('/'));
    }

    new IconLoader(url, onload);

}

IconLoader.getFaviconUrl = function(host){
    return "https://s2.googleusercontent.com/s2/favicons?domain_url="+host;
}

IconLoader.getDefaultIcon = function(){
    return chrome.extension.getURL('img/default_favicon.png');
}

// Factor to scale the canvas by to support various display densities
var pixelRatio = Math.max(window.devicePixelRatio || 1, 1);

IconLoader._canvas = document.createElement("canvas");
IconLoader._canvas.width = 16 * pixelRatio;
IconLoader._canvas.height = 16 * pixelRatio;
IconLoader._context = IconLoader._canvas.getContext("2d");
IconLoader._context.scale(pixelRatio, pixelRatio);


function IconCollection(){

    // All the images added to the loader.
    var _images = [];
    var _needsCurrentDomain = false;

    var _this = this;


    // The host shold be in the format: "http(s)://www.example.com"
    this.addHost = function(host){
        this.addURL(IconLoader.getFaviconUrl(host));
    }


    // The url should be a absolute url to an image.
    this.addURL = function(url){

        var img;

        if(url == "CURRENT_DOMAIN"){
            img = new IconLoader(IconLoader.getDefaultIcon());
            img._currentDomain = true;
            _needsCurrentDomain = true;
        }
        else{
            img = new IconLoader(url);
        }
        _images.push(img);
    }


    this.needsCurrentDomain = function(){
        return _needsCurrentDomain;
    }

    this.getCurrentDomainIndexes = function(){
        var ret = [];
        for(var i in _images){
            if(_images[i]._currentDomain === true)
                ret.push(parseInt(i));
        }
        return ret;
    }


    this.getAllIconURLs = function(tab){

        var urls = [];
        for(var i=0; i < _images.length; i++){
            var img = _images[i];
            if(img.isComplete())
                urls.push(img.getDataURL());
            else
                urls.push(IconLoader.getDefaultIcon());
        }
        return urls;
    }





}
