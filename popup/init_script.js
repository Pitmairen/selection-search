

(function(){


    var shadowElement = document.createElement("div");
    var shadowDOM = BrowserSupport.createShadowDOM(shadowElement);

    document.documentElement.appendChild(shadowElement);

    var style = new Style(shadowDOM);


    chrome.runtime.sendMessage({action:"getContentScriptData"}, function(response){

        if(BrowserSupport.hasLastError()){
            return
        }

        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            if (request.action == "getSelection"){
                let selectionUtil = new SelectionUtil(response.options)
                if(selectionUtil.hasSelection()){
                    sendResponse({selection: selectionUtil.getSelection()})
                    return
                }
            }
            sendResponse({});
        });


        var utils = new PopupActionUtils();

        let popupDisabled = false

        if(response.blacklist !== undefined){

            let blacklistMatch = _checkBlacklist(response.blacklist);

            if(response.options.use_whitelist && !blacklistMatch){
                // We use the blacklist as a whitelist and skip the popup
                // if the blacklist does not match the current url
                popupDisabled = true
            }
            else if(!response.options.use_whitelist && blacklistMatch){
                popupDisabled = true
            }
        }


        if (popupDisabled){
            if(!response.options.use_blacklist_for_hotkeys){
                // The popup is disabled by the blacklist. Still enable the hotkeys if the
                // hotkeys are not using the blacklist.
                SearchEngineHotKeys(response.engines, response.options, utils);
            }
            return
        }

        SearchEngineHotKeys(response.engines, response.options, utils);


        if(!response.options.disable_formextractor){
            var engineEditor = new EngineEditor(shadowDOM);

            initFormExtractor(engineEditor);
        }

        if(response.options.activator === 'disabled')
            return;

        // jquery effects
        $.fx.off = response.options.disable_effects;

        style.setDefaultStyle(response.default_style);
        if(response.extra_style)
            style.setCustomStyle(response.extra_style);

        var popup = new Popup(response.options, style);

        if(response.options.circular_menu){
            popup.setModifier(new CircularPopup(popup, style, response.options));
        }

        popup.setSearchEngines(response.engines);

        var actions = new ActionCollection();
        actions.setDefaultAction(new DefaultAction(popup, utils, response.options));
        actions.addAction("COPY", new CopyAction(popup));
        actions.addAction("%s", new DomainAction(popup, utils, response.options));

        if(response.options.sort_by_click){
            popup.addActionListener(new SearchCounter(response.options, utils));
        }
        popup.addActionListener(new MenuHider(popup, response.options));
        popup.addActionListener(actions);

        shadowDOM.appendChild(popup.getNode());

        if(response.options.auto_hide_delay > 0){
            EnableAutoHide(popup.getNode(), popup, response.options.auto_hide_delay);
        }
        if(response.options.hide_on_scroll){
            EnableAutoHideOnScroll(popup)
        }

        var activator = _getActivator(response.options.activator, popup, response.options, shadowDOM);
        activator.setup();

        if(response.options.open_on_dblclick){
            var a = new DoubleClickActivator(popup, response.options);
            a.setup();
        }

        if(response.options.remove_icons !== 'no')
            return;

        chrome.runtime.sendMessage({action:"getPopupIcons"}, function(response){
            popup.setIcons(response.icons);

            if(response.needsCurrentDomain){

                chrome.runtime.sendMessage({action:"getCurrentDomainIcon"}, function(response){

                    popup.setIconForIndexes(response.icon, response.indexes);

                });
            }

        });

    });


    function _checkBlacklist(blacklist){

        var hostname = location.hostname;

        if(hostname in blacklist.hostnames){
            return _checkBlacklistPaths(blacklist.hostnames[hostname]);
        }

        if(hostname.indexOf('.')){
            // Remove the sub domain and check again
            hostname = hostname.split('.').slice(1).join('.');
            if (hostname in blacklist.hostnames){
                return _checkBlacklistPaths(blacklist.hostnames[hostname]);
            }
        }

        return false;
    }

    function _checkBlacklistPaths(blackListedPaths){
        var path = location.pathname + location.search + location.hash;
        for(var i=0; i < blackListedPaths.length; i++){
            if(path.startsWith(blackListedPaths[i])){
                return true;
            }
        }
        return false;
    }

    function _getActivator(activator, popup, options, dom){

        switch(activator){
            case "combo":
                return _createComboActivator(popup, options, dom);
            case "auto":
                return _createAutoActivator(popup, options, dom);
            case "click":
                return new ClickActivator(popup, options);
            case "k_and_m":
                return new KeyAndMouseActivator(popup, options);
            default:
                return new ClickActivator(popup, options);

        }
    }

    function _createAutoActivator(popup, options, dom){
        var button = new Button(popup, style);
        if(options.auto_hide_delay > 0){
            EnableAutoHide(button.getNode(), button, options.auto_hide_delay);
        }
        if(options.hide_on_scroll){
            EnableAutoHideOnScroll(button);
        }
        var act = new AutoActivator(popup, button, options);
        dom.appendChild(button.getNode());
        return act;
    }


    function _createComboActivator(popup, options, dom){

        var combo_opts = options.activator_combo;
        var activator_map = {'auto': 1,
                            'k_and_m' : 1,
                            'click' : 1};
        var activators = [];
        for(var i in combo_opts){

            if (activator_map.hasOwnProperty(combo_opts[i])){
                activators.push(_getActivator(combo_opts[i], popup, options, dom));
            }
        }

        return new ComboActivator(popup, activators);

    }




})();
