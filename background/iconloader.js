
function IconSourceManager(sources){

    let _currentIndex = 0;

    this.currentUrl = function(){
        return _currentSource().url
    }
    this.nextUrl = function(){
        this.nextSource()
        return this.currentUrl()
    }

    this.isEmptyResponse = function(response){
        return _currentSource().isEmptyResponse(response);
    }

    this.nextSource = function(){
        _currentIndex += 1
    }

    this.hasTriedAll = function(){
        return _currentIndex >= sources.length;
    }

    function _currentSource(){
        return sources[_currentIndex % sources.length];
    }

}

function IconLoader(sources, onload){

    var _img = new Image();
    _img.setAttribute('crossOrigin', 'anonymous'); 

    _img.addEventListener("error", _onError);

    if(onload !== undefined){
        _img.addEventListener("load", _onLoad);
    }

    var _iconSources = new IconSourceManager(sources)

    _img.src = _iconSources.currentUrl();

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

        try{
            var dataUrl = _loadIconUrl();

            if(_iconSources.isEmptyResponse(dataUrl)){
                _reloadImage()
                return IconLoader.getDefaultIcon();
            }

            _urlCache = dataUrl;

        }catch(err){
            console.warn('Failed to load icon: ', _iconSources.currentUrl(), err.message)
            _urlCache = IconLoader.getDefaultIcon();
        }
        return _urlCache;
    }

    this.getDataURL = function(){
        if(_urlCache !== null)
            return _urlCache;

        if(_isError){
            _reloadImage();
            return IconLoader.getDefaultIcon();
        }

        try{
            var dataUrl = _loadIconUrl();

            if(_iconSources.isEmptyResponse(dataUrl)){
                _reloadImage()
                return IconLoader.getDefaultIcon();
            }

            _urlCache = dataUrl;

        }catch(err){
            console.warn('Failed to load icon: ', _iconSources.currentUrl(), err.message)
            _urlCache = IconLoader.getDefaultIcon();
        }
        return _urlCache;
    }

    this.getDataUrlPromise = function(){
        return new Promise(function(resolve){
            function resolveImage(imageUrl){
                _img.removeEventListener('load', imageLoaded)
                resolve(imageUrl);
            }
            function imageLoaded(){
                try{
                    var dataUrl = _loadIconUrl();
                    if(!_iconSources.isEmptyResponse(dataUrl)){
                        resolveImage(dataUrl);
                        return;
                    }
                }catch(err){
                    console.warn('Failed to load icon: ', _iconSources.currentUrl(), err.message)
                }
                if(!_iconSources.hasTriedAll()){
                    _reloadImage()
                }else{
                    resolveImage(IconLoader.getDefaultIcon());
                }
            }
            _img.addEventListener('load', imageLoaded)
        });
    }


    function _onError(e){
        _isError = true;
    }

    function _onLoad(e){
        onload(_this);
    }

    function _reloadImage(){
        _img.src = _iconSources.nextUrl()
    }

    function _loadIconUrl(){

        // Factor to scale the canvas by to support various display densities
        var pixelRatio = Math.max(window.devicePixelRatio || 1, 1);

        var canvas = document.createElement("canvas");
        canvas.width = 16 * pixelRatio;
        canvas.height = 16 * pixelRatio;


        var context = canvas.getContext("2d");
        context.scale(pixelRatio, pixelRatio);
        context.clearRect(0, 0, 16, 16);
        context.drawImage(_img, 0, 0, 16, 16);


        try{
            return canvas.toDataURL("image/png");
        }
        finally{
            canvas.remove();
        }
    }
}



IconLoader.loadCurrentDomainIcon = function(tab){

    if(tab === undefined || !tab.url){
        return Promise.resolve(IconLoader.getDefaultIcon())
    }

    let urlParts = urlparse.urlsplit(tab.url);

    if(!urlParts.hostname){
        return Promise.resolve(IconLoader.getDefaultIcon())
    }

    let cached = iconLoaderCurrentDomainLruCache.get(urlParts.hostname)
    if(cached){
        return Promise.resolve(cached);
    }

    var sources = iconLoaderAutoSourcesHostname(urlParts.hostname)

    return new IconLoader(sources).getDataUrlPromise().then(function(url){
        iconLoaderCurrentDomainLruCache.set(urlParts.hostname, url)
        return url
    })
}

IconLoader.getDefaultIcon = function(){
    return chrome.extension.getURL('img/default_favicon.png');
}


function IconCollection(){

    // All the images added to the loader.
    var _images = [];
    var _needsCurrentDomain = false;

    var _this = this;


    // The host shold be in the format: "http(s)://www.example.com"
    this.addHost = function(host){
        _images.push(new IconLoader(iconLoaderAutoSourcesUrl(host)))
    }


    // The url should be a absolute url to an image.
    this.addURL = function(url){

        var img;

        if(url == "CURRENT_DOMAIN"){
            img = new IconLoader([new IconSourceUrl(IconLoader.getDefaultIcon())]);
            img._currentDomain = true;
            _needsCurrentDomain = true;
        }
        else{
            img = new IconLoader([new IconSourceUrl(url)]);
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


const EMPTY_ICON_RESPONSE_GOOGLE_S2 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAqdJREFUOE9jZKAQMML0h4au4nz567WItYmS6e9ff7Lff/hu8vHTDx6QPB8vxxdBAc4zbOwsU4+euXdanE30zerVYd9BcmADQJq//H4vpaImnvrl608/FUVhMTklIeFfv/8ysLEyMyjKCTPs3n3j7YNH71/x8bJtunPr9WweVsFnIEPABtj5T5XVV5fO/vb9T5SWjpisorwwAzcXG4ORrgzD12+/GOSl+Biev/7GcPnGM4Zly88+5uNmW3bx9vOphzZmPwYbUNm8PejZ848tqUmWmq/efAH7ihVoMwjoakiCDfj7j4Hh0Kn7YCfPX3TyurSUQE17rec6sAHFNZv38nCz6deWuQlv2n0NJVidbdQY+LhZGD59/cOw98gtBiU5IYY16y6+/fr918X+Vj9nsAFJOas+JiWY8+lqSIEVwQBMM4gPcsHNe28Ybt59xSAmwsMwZ96JTwumhfODDQiOW/i3o8mPSUVegGHX4TsMMpICYAyyGRnsP3Gf4cPH70BvSTGU12z8t25JAjPcgMk9IUySolxgp5449wAcgCICHBgGgAJVQ1mcoQxowHqYAYnZKz8mJ1rwWRvLwTUcPfsIzlaSE2EAGQ4Cbz78AHtj9tzjnxZOj4B4ARaIDRVuwjBdsECD8aWBXjLTkwJzKxq2v/3168/F/nZoIFY0bg98/uJja2qypSbMFegGgDT6uWoxnDj/iGHmnGPXgQZWd9R7rkdKSJLZn778igKmBVmYIXcefgAnHkh6kGJ4+eYTw8zZxx4L8LKjJiREUhZN/fj5p5+MJL+Yl5e28G9gUr736C3Dr19/GR7ff//28bMPrwR42DfduYOWlEE2wDKTlZGSyc9fv3Pev/9u8unzD57///+DM5OwENdpLg6WKafO3D/Lj56ZUOKKRA4AXks6IOHwHr4AAAAASUVORK5CYII="


function IconSourceGoogleS2(hostname){
    this.url = "https://s2.googleusercontent.com/s2/favicons?domain_url=" + hostname;
    this.isEmptyResponse = function(data){
        return data === EMPTY_ICON_RESPONSE_GOOGLE_S2
    }
}

function IconSourceFaviconKit(hostname){
    this.url = "https://api.faviconkit.com/" + hostname
    this.isEmptyResponse = function(data){
        return false;
    }
}

function IconSourceUrl(url){
    this.url = url;
    this.isEmptyResponse = function(){
        return false;
    }
}

function iconLoaderAutoSourcesUrl(url){

    var urlParts = urlparse.urlsplit(url);

    if(urlParts.hostname.trim().length === 0){
        return [new IconSourceUrl(IconLoader.getDefaultIcon())];
    }

    return iconLoaderAutoSourcesHostname(urlParts.hostname);
}

function iconLoaderAutoSourcesHostname(hostname){
    return [
        new IconSourceGoogleS2(hostname),
        new IconSourceFaviconKit(hostname),
    ]
}


// https://stackoverflow.com/a/46432113/183921
class LRU {
    constructor(max = 5) {
        this.max = max;
        this.cache = new Map();
    }
    get(key) {
        let item = this.cache.get(key);
        if (item) {
            // refresh key
            this.cache.delete(key);
            this.cache.set(key, item);
        }
        return item;
    }
    set(key, val) {
        // refresh key
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        // evict oldest
        else if (this.cache.size == this.max){
            this.cache.delete(this.first());
        }
        this.cache.set(key, val);
    }

    first() {
        return this.cache.keys().next().value;
    }
}


const iconLoaderCurrentDomainLruCache = new LRU(5)