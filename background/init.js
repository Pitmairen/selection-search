
(function(){

    var _previousVersion = localStorage['VERSION'];

    Storage.storage_upgrades(_previousVersion);


    // Added in version 0.1.4
    localStorage['VERSION'] = '0.8.15';



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
        loadIcons(_iconCollection, engines, _options);


        if(is_click_count_update == undefined || !is_click_count_update){
            _clickCounter.cleanupStorage(engines);
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
    var _clickCounter = new ClickCounter();

    // _storageUpdated();


    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){

        switch(request.action){

            case "getContentScriptData":
                return getContentScriptData(sendResponse, _clickCounter);
            case "updateClickCount":
                _updateClickCount(request.engine);
                sendResponse({});
                return;
            case "getPopupIcons":
                return getPopupIcons(_iconCollection, sendResponse);
            case "getOptions":
                return getOptions(sendResponse);
            case "copyToClipboard":
                return copyToClipboard(request, sendResponse);
            case "openAllUrls":
                return openAllUrls(request, sendResponse, sender.tab);
            case "getCurrentDomainIcon":
                return getCurrentDomainIcon(_iconCollection, sendResponse, sender.tab);
            case "saveEngine":
                saveEngine(request, sendResponse);
                _storageUpdated();
                return;
            case "storageUpdated":
                Sync.saveStorage(Storage);
                _storageUpdated();
                sendResponse({});
                return;
            default:
                sendResponse({});
                return;

        }


    });
    

    chrome.storage.sync.get(null, function(items){

        if(chrome.runtime.lastError !== undefined){

            var notification = webkitNotifications.createNotification(
                'img/icon48.png',
                'Synchronization Error',
                'Failed to load synced settings ('+chrome.runtime.lastError['message']+')'
            );

            _storageUpdated();
            notification.show();
            return;
        }

        Sync.loadStorage(Storage, items);

        Storage.storage_upgrades(_previousVersion);

        _storageUpdated();

    });



    chrome.storage.onChanged.addListener(function(changes, type){

        if(type != 'sync')
            return;

        Sync.updateStorage(Storage, changes);

        _storageUpdated();

    });

})();
