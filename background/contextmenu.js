

function ContextMenu(options, _clickCounterCallback){


    let _rootItem = null;
    let _options = options;
    let _idCounter = 0
    let _onClickCallbacks = {}

    chrome.contextMenus.onClicked.addListener(_onClickItem)

    this.setSearchEngines = function(engines){

        _onClickCallbacks = {}
        _createRootItem().then(() => {
            _addEngines(engines, _rootItem);
        })
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

        let id = chrome.contextMenus.create({
            'id': _nextItemId(),
            'title' :  engine.name,
            'contexts' : ['selection'],
            'parentId' : parentItem,
        });
        _registerOnClick(id, function(info, tab){
            _onEngineClick(engine, info, tab);
        })

    }

    function _addSeparatorItem(engine, parentItem){

        chrome.contextMenus.create({
            'id': _nextItemId(),
            'type' : 'separator',
            'contexts' : ['selection'],
            'parentId' : parentItem,
        });

    }



    function _addSubMenuItem(engine, parentItem){

        var menu = {
            'id': _nextItemId(),
            'title' :  engine.name,
            'contexts' :  ['selection'],
            'parentId' : parentItem,
        };

        let id = chrome.contextMenus.create(menu);

        if(engine.openall && engine.hidemenu){
            _registerOnClick(id, function(info, tab){
                _onOpenAll(engine, info, tab);
            })
        }

        if(engine.openall && engine.hidemenu){
            return;
        }
        else if(engine.openall){
            _addOpenAllItem(engine, id);
        }

        _addEngines(engine.engines, id);
    }

    function _onEngineClick(engine, info, tab){
        var utils = new ContextMenuActionUtils(info, tab);
        utils.openEngine(engine, info.selectionText)
        _clickCounterCallback(engine);
    }

    function _onOpenAll(engine, info, tab){
        var utils = new ContextMenuActionUtils(info, tab);
        utils.openAllInSubmenu(engine, info.selectionText)
        _clickCounterCallback(engine);
    }


    function _addOpenAllItem(engine, parentItem){

        let id = chrome.contextMenus.create({
            'id': _nextItemId(),
            'title' :  "Open all",
            'contexts' :  ['selection'],
            'parentId' : parentItem,
        });

        _registerOnClick(id, function(info, tab){
                _onOpenAll(engine, info, tab);
        })

        _addSeparatorItem(engine, parentItem);


    }


    function _removeRootItem(){
        return new Promise((resolve, reject) => {
            if(_rootItem != null){
                chrome.contextMenus.remove(_rootItem, () => {
                    _rootItem = null
                    _onClickCallbacks = {}
                    resolve()
                })
            } else {
                resolve()
            }
        })
    }

    function _createRootItem(){
        return _removeRootItem().then(() => {
            _rootItem = chrome.contextMenus.create({
                'id': 'ss-context-menu-root',
                'title' : 'Search',
                'contexts' : ['selection']
            }, () => {
                _idCounter = 0;
                return Promise.resolve()
            })
        })
    }

    function _nextItemId(){
        return `${_idCounter++}`;
    }

    function _onClickItem(info, tab){
        let cb = _onClickCallbacks[info.menuItemId]
        if(cb){
            cb(info, tab)
        }
    }

    function _registerOnClick(id, callback){
        _onClickCallbacks[id] = callback
    }
}


