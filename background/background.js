

function saveEngine(request, sendResponse){

    var engines = Storage.getSearchEngines();
    engines.push(request.engine);

    Storage.setSearchEngines(engines);

    Sync.saveStorage(Storage);

    sendResponse({});

}



function openAllUrls(request, sendResponse, parent_tab){

    var opt = Storage.getOptions();

    var urls;

    if (request.urlsWithOptions !== undefined){
        urls = request.urlsWithOptions;
    }else{
        urls = request.urls.map(function(url){
            return {url: url, incognito: false, newwindow: false};
        });
    }

    for(var i in urls){
        i = parseInt(i);

        if (urls[i].url == 'COPY') {
            copyToClipboard({text:request.selection}, function(){});
            continue;
        }

        if(urls[i].incognito){
            chrome.windows.create({
                'url' : urls[i].url,
                'incognito' : true
            });
            continue;
        } else if(urls[i].newwindow){
            chrome.windows.create({
                'url' : urls[i].url,
            });
            continue;
        }

        // If we open multiple urls, and the newtabs option is off, we open the first tab in the
        // current tab
        if(i == 0 && !opt.newtab){
            chrome.tabs.update({url: urls[i].url});
            continue;
        }

        var tab_opts = {
            'url' : urls[i].url,
            'active' : !_shouldOpenInNewTab(opt.background_tab, request.in_background_tab),
        };

        if(parent_tab != undefined){
            if(parent_tab.id >= 0)
                tab_opts['openerTabId'] = parent_tab.id;

            if(!opt.open_new_tab_last){
                tab_opts.index = parent_tab.index + 1 + i;
            }
        }

        chrome.tabs.create(tab_opts);
    }


    sendResponse({});

}





function copyToClipboard(request, sendResponse) {

    var copyDiv = document.createElement('div');
    copyDiv.contentEditable = true;
    document.body.appendChild(copyDiv);
    copyDiv.innerText = request.text;
    copyDiv.unselectable = "off";
    copyDiv.focus();
    document.execCommand('SelectAll');
    document.execCommand("Copy", false, null);
    document.body.removeChild(copyDiv);

    sendResponse({});
}

function getContentScriptData(sendResponse, clickCounter){

    resp = {};


    resp.default_style = document.getElementById("default-style").innerText;
    resp.extra_style = Storage.getStyle('');


    resp.options = Storage.getOptions();

    if(clickCounter != undefined && resp.options.sort_by_click)
        resp.engines = clickCounter.sortEngines(Storage.getSearchEngines());
    else
        resp.engines = Storage.getSearchEngines();


    resp.blacklist = Blacklist.getBlacklist();

    sendResponse(resp);

}


function getIcons(iconCollection, sendResponse){

    resp = {};


    resp.icons = iconCollection.getAllIconURLs();
    resp.needsCurrentDomain = iconCollection.needsCurrentDomain();

    sendResponse(resp);

}

function getCurrentDomainIcon(iconCollection, sendResponse, tab){

    resp = {};

    resp.indexes = iconCollection.getCurrentDomainIndexes();

    if(resp.indexes.length > 0){
        IconLoader.loadCurrentDomainIcon(tab, function(icon){
            resp.icon = icon.getDataURL();
            sendResponse(resp);
        });
        return true;
    }else{
        sendResponse(resp);
    }
    return;
}

function getOptions(sendResponse){

    resp = {};

    resp.options = Storage.getOptions();
    resp.sync_options = Storage.getSyncOptions();

    resp.searchEngines = Storage.getSearchEngines();

    resp.default_style = $('#default-style').text();
    resp.extra_style = Storage.getStyle('');

    resp.blacklist = Storage.getBlacklistDefinitions();

    sendResponse(resp);

}


function loadPopupIcons(iconCollection, engines, options){

    if(options.remove_icons !== 'no')
        return;

    _loadIcons(iconCollection, engines, en => {
        return options.separate_menus && en.hide_in_popup
    })
}

function loadToolbarIcons(iconCollection, engines, options){
    _loadIcons(iconCollection, engines, en => {
        return options.separate_menus && en.hide_in_toolbar
    })
}

function _loadIcons(iconCollection, engines, skipCheck){

    for(var i=0; i < engines.length; i++){

        var en = engines[i];

        if(skipCheck(en)){
            continue;
        }

        if(en.icon_url !== undefined)
            iconCollection.addURL(en.icon_url);
        else if(en.is_separator)
            continue;
        else if(en.is_submenu && (!en.url || en.url === "Submenu"))
            iconCollection.addURL(chrome.extension.getURL('img/folder.png'));
        else if(en.url == 'COPY')
            iconCollection.addURL(chrome.extension.getURL('img/copy.png'));
        else{
            var host = en.url.split('/').slice(0, 3).join('/');
            iconCollection.addHost(host);
        }

        if(en.is_submenu){
            _loadIcons(iconCollection, en.engines, skipCheck);
        }
    }
}


function _shouldOpenInNewTab(global_option, engine_option)
{
    if(engine_option == undefined)
        return global_option;
    return engine_option;
}

