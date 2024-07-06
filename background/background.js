
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
            if(urls[i].popupwindow){
                chrome.windows.create({
                    'url' : urls[i].url,
                    'type': 'popup',
                    'incognito' : true,
                    'width': 600,
                    'height': 600,
                });
            }else{
                chrome.windows.create({
                    'url' : urls[i].url,
                    'incognito' : true
                });
            }
            continue;
        } else if(urls[i].newwindow){
            if(urls[i].popupwindow){
                chrome.windows.create({
                    'url' : urls[i].url,
                    'type': 'popup',
                    'width': 600,
                    'height': 600,
                });
            }else{
                chrome.windows.create({
                    'url' : urls[i].url,
                });
            }
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


function hasOffscreenDocument(url) {
    if ('getContexts' in chrome.runtime) {
      const offscreenUrl = chrome.runtime.getURL(url);
      return chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [offscreenUrl]
      }).then(function(contexts){
        return Boolean(contexts.length)
      })
    } else {
      return clients.matchAll().then(function(matchedClients){
        return matchedClients.some(client => {
            return client.url.includes(chrome.runtime.id)
            && client.url.includes(url) // TODO: test
        })
      })
    }
}

// https://developer.chrome.com/docs/extensions/reference/api/offscreen
let creatingOffscreenClipboardDocument = null; // A global promise to avoid concurrency issues

function setupOffscreenDocument(path) {
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  //const offscreenUrl = chrome.runtime.getURL(path);

  return hasOffscreenDocument(path).then(exists => {
    if(exists) {
        return
    }
    if(creatingOffscreenClipboardDocument){
        return creatingOffscreenClipboardDocument
    }
    creatingOffscreenClipboardDocument = chrome.offscreen.createDocument({
        url: path,
        reasons: [chrome.offscreen.Reason.CLIPBOARD],
        justification: "Copy selection to clipboard",
    });

    return creatingOffscreenClipboardDocument.then(result => {
        creatingOffscreenClipboardDocument = null;
        return result
    })
  })
}


function copyToClipboard(request, sendResponse) {
    setupOffscreenDocument("background/copy-to-clipboard.html").then(() => {
        chrome.runtime.sendMessage({
            type: 'copy-data-to-clipboard',
            target: 'offscreen-doc',
            data: request.text
        }).then((result) => {
            sendResponse({});
        })
    })
}

function getContentScriptData(sendResponse, clickCounter){

    let resp = {};


    resp.default_style = defaultStyleCSS;
    resp.extra_style = Storage.getStyle('');


    resp.options = Storage.getOptions();

    if(clickCounter != undefined && resp.options.sort_by_click)
        resp.engines = clickCounter.sortEngines(Storage.getSearchEngines());
    else
        resp.engines = Storage.getSearchEngines();


    resp.blacklist = Blacklist.getBlacklist();

    sendResponse(resp);

}

function filterPopupEngines(engines, options){
    return filterEngines(engines, en => {
        return options.separate_menus && en.hide_in_popup
    })
}

function filterToolbarEngines(engines, options){
    return filterEngines(engines, en => {
        return options.separate_menus && en.hide_in_toolbar
    })
}

function filterEngines(engines, skipCheck){
    return engines.filter(en => !skipCheck(en)).map((en) => {
        if(en.is_submenu){
            // Make sure we don't modify engines as this affect the actual stored data
            return {
                ...en, engines: filterEngines(en.engines, skipCheck)
            }
        }
        return en
    })
}

function getIcons(iconCollection, sendResponse, skipCheck){
    let resp = {};
    iconCollection.getIconUrls().then(icons => {
        resp.icons = icons
        resp.needsCurrentDomain = iconCollection.needsCurrentDomain();
        sendResponse(resp);
    })
    return true
}

function getCurrentDomainIcon(iconCollection, iconLoader, sendResponse, tab){
    let resp = {};
    resp.indexes = iconCollection.getCurrentDomainIndexes();
    if(resp.indexes.length > 0){
        iconLoader.getCurrentDomainIcon(tab).then(function(iconUrl){
            resp.icon = iconUrl
            sendResponse(resp);
        })
        return true;
    }else{
        sendResponse(resp);
    }
    return;
}

function getOptions(sendResponse){

    let resp = {};

    resp.options = Storage.getOptions();
    resp.sync_options = Storage.getSyncOptions();

    resp.searchEngines = Storage.getSearchEngines();

    resp.default_style = defaultStyleCSS;
    resp.extra_style = Storage.getStyle('');

    resp.blacklist = Storage.getBlacklistDefinitions();

    sendResponse(resp);

}


function _shouldOpenInNewTab(global_option, engine_option)
{
    if(engine_option == undefined)
        return global_option;
    return engine_option;
}

