

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
            _utils.copyToClipboard(request.selection);
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

function getContentScriptData(sendResponse){

	resp = {};


	resp.default_style = document.getElementById("default-style").innerText;
	resp.extra_style = Storage.getStyle('');

    resp.engines = Storage.getSearchEngines();
    resp.options = Storage.getOptions();

    sendResponse(resp);

}

function getPopupIcons(iconLoader, sendResponse, tab){

	resp = {};

    iconLoader.loadCurrentDomain(tab);

    if(iconLoader.isFinishedLoading()){
        resp.icons = iconLoader.getAllIconURLs(tab);
        sendResponse(resp);
        return;

    }else{

        iconLoader.addLoadedListener(function(){

            resp.icons = iconLoader.getAllIconURLs(tab);

            sendResponse(resp);
        });

        return true;

    }

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





function loadIcons(iconLoader, engines, options){

    if(options.remove_icons !== 'no')
        return;

    for(var i=0; i < engines.length; i++){

        var en = engines[i];

        if(options.separate_menus && en.hide_in_popup){
            continue;
        }

        if(en.icon_url !== undefined)
            iconLoader.addURL(en.icon_url);
        else if(en.is_separator)
            continue;
	    else if(en.is_submenu)
            iconLoader.addURL(chrome.extension.getURL('img/folder.png'));
        else if(en.url == 'COPY')
            iconLoader.addURL(chrome.extension.getURL('img/copy.png'));
        else{
            var host = en.url.split('/').slice(0, 3).join('/');
            iconLoader.addHost(host);
        }

        if(en.is_submenu)
            loadIcons(iconLoader, en.engines, options);
    }
}


function _shouldOpenInNewTab(global_option, engine_option)
{
    if(engine_option == undefined)
        return global_option;
    return engine_option;
}

