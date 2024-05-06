

function Background(_previousVersion) {

    function _storageUpdated(is_click_count_update){

        _options = Storage.getOptions();

        _contextMenu.setOptions(_options);

        var engines = Storage.getSearchEngines();

        if(_options.sort_by_click){
            engines = _clickCounter.sortEngines(engines);
        }

        if(_options.context_menu === "enabled")
            _contextMenu.setSearchEngines(engines);
        else
            _contextMenu.disable();

        // Create a new icon collection object. And reload
        // all the icons.
        _iconCollection = new IconCollection();
        _toolbarIconCollection = new IconCollection();
        loadPopupIcons(_iconCollection, engines, _options);
        loadToolbarIcons(_toolbarIconCollection, engines, _options);


        if(is_click_count_update == undefined || !is_click_count_update){
            _clickCounter.cleanupStorage(engines);
        }

        Blacklist.setDefinitions(Storage.getBlacklistDefinitions());

        if(_options.toolbar_popup === 'enabled'){
            chrome.action.enable()
        }else{
            chrome.action.disable()
        }

    }

    function _updateClickCount(engine){
        if(_options.sort_by_click){
            _clickCounter.clicked(engine);
            _storageUpdated();
        }
    }

    var _options = Storage.getOptions();
    var _contextMenu = new ContextMenu(_options, _updateClickCount);
    var _iconCollection = new IconCollection();
    var _toolbarIconCollection = new IconCollection();
    var _clickCounter = new ClickCounter(Storage);

    _storageUpdated();


    this.onMessage = function(request, sender, sendResponse){

        switch(request.action){

            case "getContentScriptData":
                return getContentScriptData(sendResponse, _clickCounter);
            case "updateClickCount":
                _updateClickCount(request.engine);
                sendResponse({});
                return;
            case "getPopupIcons":
                return getIcons(_iconCollection, sendResponse);
            case "getToolbarIcons":
                return getIcons(_toolbarIconCollection, sendResponse);
            case "getOptions":
                return getOptions(sendResponse);
            case "copyToClipboard":
                return copyToClipboard(request, sendResponse);
            case "openAllUrls":
                return openAllUrls(request, sendResponse, sender.tab);
            case "getCurrentDomainIcon":
                return getCurrentDomainIcon(_iconCollection, sendResponse, sender.tab);
            case "getCurrentDomainIconToolbar":
                return getCurrentDomainIcon(_toolbarIconCollection, sendResponse, {url: request.url});
            case "saveEngine":
                saveEngine(request, sendResponse);
                _storageUpdated();
                return;
            case "storageUpdated":
                storageLocalRefresh(Storage).then(function(){
                    Sync.saveStorage(Storage);
                    _storageUpdated();
                    sendResponse({});
                });
                return;
            default:
                sendResponse({});
                return;
        }
    }

    this.onStorageChanged = function(changes, type){
        if(type != 'sync')
            return;

        Sync.updateStorage(Storage, changes);

        _storageUpdated();
    }

    this.onContextMenuItemClicked = function(info, tab){
        _contextMenu.onItemClicked(info, tab)
    }

    if (Storage.isSyncEnabled()){

        chrome.storage.sync.get(null, function(items){

            if (BrowserSupport.hasLastError()) {

                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: '/img/icon48.png',
                    title: 'Synchronization Error',
                    message: 'Failed to load synced settings ('+chrome.runtime.lastError['message']+')'
                });

                _storageUpdated();
                return;
            }

            Sync.loadStorage(Storage, items);

            Storage.storage_upgrades(_previousVersion);

            _storageUpdated();

        });

    }

}

function initBackground(){

    let CURRENT_VERSION = '0.8.64';

    return storageLocalSyncInit(Storage).then(values => {

        var _previousVersion = values.VERSION;
        var _do_localstorage_import = false;

        Storage.storage_upgrades(_previousVersion);

        // The version value was added in version 0.1.4 (stored in localStorage)
        // Was moved to chrome.storage.local in version 0.8.48
        Storage.setVersion(CURRENT_VERSION);

        return Promise.resolve(new Background(_previousVersion))
    });
}


function initServiceWorker(){

    let _background = initBackground()

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
        _background.then(bg => {
            bg.onMessage(request, sender, sendResponse)
        })
        return true
    });

    chrome.storage.onChanged.addListener(function(changes, type){
        _background.then(bg => {
            bg.onStorageChanged(changes, type)
        })
    });

    chrome.contextMenus.onClicked.addListener(function(info, tab){
        _background.then(bg => {
            bg.onContextMenuItemClicked(info, tab)
        })
    })
}

