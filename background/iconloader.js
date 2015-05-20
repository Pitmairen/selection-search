

function IconLoader(){

    // All the images added to the loader.
    var _images = [];

    var _canvas = _createCanvas();
    var _context = _canvas.getContext("2d");


    // Used to track if all the images are done loading.
    var _loadingCount = 0;

    var _listeners = [];


    var _needsCurrentDomain = false;

    var _this = this;


    this.reset = function(){
        _images = [];
        _loadingCount = 0;
        _listeners = [];
        _needsCurrentDomain = false;
    }

    // The host shold be in the format: "http(s)://www.example.com"
    this.addHost = function(host){
        this.addURL(_getFaviconUrl(host));
    }


    // The url should be a absolute url to an image.
    this.addURL = function(url){


        var img = new Image();
        img.onload = _onImgLoaded;
        img.onerror = _onImgError(img);

        if(url == "CURRENT_DOMAIN"){
            img._currentDomain = true;
            _needsCurrentDomain = true;
        }
        else{
            img.src = url;
            _loadingCount++;
        }

        _images.push(img);
    }


    // Loads the icon for the current domain if
    // it is needed.
    this.loadCurrentDomain = function(tab){
        if(!_needsCurrentDomain)
            return;

        var url = _getDefaultIcon();
        if(tab !== undefined && tab.url){
            url = _getFaviconUrl(tab.url.split('/').slice(0, 3).join('/'));
        }

        for(var i=0; i < _images.length; i++){

            if(_images[i]._currentDomain === true && _images[i].src !== url){
                _loadingCount++;
                _images[i].src = url;
            }

        }

    }

    this.isFinishedLoading = function(){
        return _loadingCount === 0;
    }


    this.getIconURL = function(index){
        return _getIconDataUrl(_images[index]);
    }

    this.getAllIconURLs = function(tab){

        var urls = [];
        for(var i=0; i < _images.length; i++){
            urls.push(_getIconDataUrl(_images[i]));
        }
        return urls;
    }

    this.addLoadedListener = function(callback){
        if(_this.isFinishedLoading())
            callback();
        else
            _listeners.push(callback);

    }

    function _callListeners(){

        for(var i in _listeners){
            _listeners[i]();
        }
        _listeners = [];

    }


    function _getFaviconUrl(host){

        return "https://plus.google.com/_/favicon?domain="+host;
    }

    function _getIconDataUrl(img){
        _context.clearRect(0, 0, 16, 16);
        _context.drawImage(img, 0, 0);
        return _canvas.toDataURL("image/png");
    }


    function _createCanvas(){
        
        var c = document.createElement("canvas");
        c.width = "16";
        c.height = "16";
        return c;

    }

    function _onImgLoaded(e){
        
        _loadingCount--;

        if(_this.isFinishedLoading())
            _callListeners();

    }


    function _onImgError(img){
        return function(e){
            img.src = _getDefaultIcon();
        }
    }


    function _getDefaultIcon(){

        return chrome.extension.getURL('img/default_favicon.png');

    }




}
