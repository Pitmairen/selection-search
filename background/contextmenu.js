

function ContextMenu(options){


    var _rootItem = null;
    var _options = options;


    this.setSearchEngines = function(engines){

        _createRootItem();


        _addEngines(engines, _rootItem);

    }

    
    this.disable = function(){
        _removeRootItem();

    }


    this.setOptions = function(options){
        _options = options;

    }


    function _addEngines(engines, parentItem){

        for(var i in engines){
            _addEngine(engines[i], parentItem);
        }

    }


    function _addEngine(engine, parentItem){

        if(_options.separate_menus && engine.hide_in_ctx)
            return;

        if(engine.is_submenu)
            _addSubMenuItem(engine, parentItem);
        else if(engine.is_separator)
            _addSeparatorItem(engine, parentItem);
        else
            _addEngineItem(engine, parentItem);

    }


    function _addEngineItem(engine, parentItem){

        var id = chrome.contextMenus.create({
            'title' :  engine.name,
            'contexts' : ['selection'],
            'parentId' : parentItem,

            'onclick' : function(info, tab){
                _onEngineClick(engine, info, tab);
            }
        });

    }

    function _addSeparatorItem(engine, parentItem){

        chrome.contextMenus.create({
            'type' : 'separator',
            'contexts' : ['selection'],
            'parentId' : parentItem,
        });

    }

    

    function _addSubMenuItem(engine, parentItem){

        var menu = {
            'title' :  engine.name,
            'contexts' :  ['selection'],
            'parentId' : parentItem,
        };

        if(engine.openall && engine.hidemenu){
            menu.onclick = function(info, tab){
                _openAllUrls(engine, info, tab);
            }
            return;
        }

        var id = chrome.contextMenus.create(menu);

        if(engine.openall)
            _addOpenAllItem(engine, id);

        _addEngines(engine.engines, id);

    }
    
    function _onEngineClick(engine, info, tab){
        var utils = new ContextMenuActionUtils(info, tab);
        utils.openEngine(engine, info.selectionText)
    }

    function _onOpenAll(engine, info, tab){
        var utils = new ContextMenuActionUtils(info, tab);
        utils.openAllInSubmenu(engine, info.selectionText)

    }


    function _addOpenAllItem(engine, parentItem){


        chrome.contextMenus.create({
            'title' :  "Open all",
            'contexts' :  ['selection'],
            'parentId' : parentItem,

            'onclick' : function(info, tab){
                _onOpenAll(engine, info, tab);
            }
        });

        _addSeparatorItem(engine, parentItem);


    }


    function _removeRootItem(){
        if(_rootItem != null){
            chrome.contextMenus.remove(_rootItem);
        }
    }

    function _createRootItem(){

        _removeRootItem();

        _rootItem = chrome.contextMenus.create({
            'title' : 'Search',
            'contexts' : ['selection']
        })

    }




}


