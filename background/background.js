

function saveEngine(request, sendResponse){

    var engines = Storage.getSearchEngines();
    engines.push(request.engine);

    Storage.setSearchEngines(engines);

    Sync.saveStorage(Storage);

    sendResponse({});

}



function openAllUrls(request, sendResponse, parent_tab){

    var opt = Storage.getOptions();
    var urls = request.urls;

    for(var i in urls){
        i = parseInt(i);

        if (urls[i] == 'COPY') {
            copyToClipboard({text:request.selection}, function(){});
            continue;
        }

        var tab_opts = {
            'url' : urls[i],
            'active' : !_shouldOpenInNewTab(opt.background_tab, request.in_background_tab),
        };
        if(parent_tab.id >= 0)
            tab_opts['openerTabId'] = parent_tab.id;


        if(!opt.open_new_tab_last){
            tab_opts.index = parent_tab.index + 1 + i;
        }

        chrome.tabs.create(tab_opts);
    }


    sendResponse({});

}





function copyToClipboard(request, sendResponse) {

    var copyDiv = document.createElement('div');
    copyDiv.contentEditable = true;
    document.body.appendChild(copyDiv);
    copyDiv.innerHTML = request.text;
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


    sendResponse(resp);

}


function getPopupIcons(iconCollection, sendResponse){

    resp = {};


    resp.icons = iconCollection.getAllIconURLs();
    resp.needsCurrentDomain = iconCollection.needsCurrentDomain();

    sendResponse(resp);

}

function getCurrentDomainIcon(iconCollection, sendResponse, tab){

    resp = {};

    resp.indexes = iconCollection.getCurrentDomainIndexes();

    IconLoader.loadCurrentDomainIcon(tab, function(icon){

        resp.icon = icon.getDataURL();
        sendResponse(resp);

    });

    return true;
}

function getOptions(sendResponse){

    resp = {};

    resp.options = Storage.getOptions();
    resp.sync_options = Storage.getSyncOptions();

    resp.searchEngines = Storage.getSearchEngines();

    resp.default_style = $('#default-style').text();
    resp.extra_style = Storage.getStyle('');


    sendResponse(resp);

}


function loadIcons(iconCollection, engines, options){

    if(options.remove_icons !== 'no')
        return;

    for(var i=0; i < engines.length; i++){

        var en = engines[i];

        if(options.separate_menus && en.hide_in_popup){
            continue;
        }

        if(en.icon_url !== undefined)
            iconCollection.addURL(en.icon_url);
        else if(en.is_separator)
            continue;
        else if(en.is_submenu)
            iconCollection.addURL(chrome.extension.getURL('img/folder.png'));
        else if(en.url == 'COPY')
            iconCollection.addURL(chrome.extension.getURL('img/copy.png'));
        else{
            var host = en.url.split('/').slice(0, 3).join('/');
            iconCollection.addHost(host);
        }

        if(en.is_submenu)
            loadIcons(iconCollection, en.engines, options);
    }
}


function _shouldOpenInNewTab(global_option, engine_option)
{
    if(engine_option == undefined)
        return global_option;
    return engine_option;
}

