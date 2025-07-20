

function ContextMenu(options, _clickCounterCallback){


    let _rootItem = 'ss-context-menu-root'
    let _options = options;
    let _idCounter = 0
    let _onClickCallbacks = {}
    let _iconMenuIds = []
    let _currentPromise = Promise.resolve();


    this.onItemClicked = function(info, tab){
        _currentPromise.then(() =>{
            _onClickItem(info, tab)
        })
    }

    this.setSearchEngines = async function(engines){
        _currentPromise = doSetEngines(engines)
        await _currentPromise
    }

    this.setIcons = async function(icons){
        _iconMenuIds.forEach(async (id, index) => {
            let icon = icons[index]
            if(icon){
                try{
                    await browser.contextMenus.update(id, {
                        icons: { 16: icon }
                    })
                }catch(err){
                    console.warn("Failed to update context menu icon", err)
                }
            }
        })
    }

    function doSetEngines(engines){
        return new Promise((resolve, reject) => {
            _createRootItem().then(() => {
                _idCounter = 0;
                _onClickCallbacks = {}
                _iconMenuIds = []
                _addEngines(engines, _rootItem).then(() =>{
                    resolve()
                })
            })
        })
    }


    this.disable = function(){
        _currentPromise = doDisable(_currentPromise).then(()=>{
            _currentPromise = Promise.resolve();
        })
    }

    function doDisable(currentPromise){
        return new Promise((resolve, reject) => {
            currentPromise.then(() => {
                _removeRootItem().then(() => {
                    _idCounter = 0;
                    _onClickCallbacks = {}
                    _iconMenuIds = []
                    resolve()
                })
            })
        })
    }

    this.setOptions = function(options){
        _options = options;

    }


    function _addEngines(engines, parentItem){
        return new Promise(async (resolve, reject) => {
            for(var i in engines){
                // Await to make sure that the engines are added in order. This is used to match
                // the engine index with the icon index.
                await _addEngine(engines[i], parentItem)
            }
            resolve()
        })
    }


    function _addEngine(engine, parentItem){
        return new Promise((resolve, reject) => {
            if(_options.separate_menus && engine.hide_in_ctx){
                resolve()
            }
            else if(engine.is_submenu){
                resolve(_addSubMenuItem(engine, parentItem))
            }
            else if(engine.is_separator){
                resolve(_addSeparatorItem(engine, parentItem))
            }
            else{
                resolve(_addEngineItem(engine, parentItem))
            }
        })
    }


    function _addEngineItem(engine, parentItem){
        return new Promise((resolve, reject) => {
            let id = _nextItemId()
            chrome.contextMenus.create({
                'id': id,
                'title' :  engine.name,
                'contexts' : ['selection'],
                'parentId' : parentItem,
            }, function(){
                _registerIconItem(id, engine);
                _registerOnClick(id, function(info, tab){
                    _onEngineClick(engine, info, tab);
                })
                resolve()
            })
        });
    }

    function _addSeparatorItem(engine, parentItem){
        return new Promise((resolve, reject) => {
            chrome.contextMenus.create({
                'id': _nextItemId(),
                'type' : 'separator',
                'contexts' : ['selection'],
                'parentId' : parentItem,
            }, function(){
                resolve()
            });
        })
    }



    function _addSubMenuItem(engine, parentItem){

        let id = _nextItemId()
        var menu = {
            'id': id,
            'title' :  engine.name,
            'contexts' :  ['selection'],
            'parentId' : parentItem,
        };

        return new Promise((resolve, reject) => {
            chrome.contextMenus.create(menu, function(){
                _registerIconItem(id, engine);
                if(engine.openall && engine.hidemenu){
                    _registerOnClick(id, function(info, tab){
                        _onOpenAll(engine, info, tab);
                    })
                }

                if(engine.openall && engine.hidemenu){
                    resolve()
                }
                else if(engine.openall){
                    _addOpenAllItem(engine, id).then(() => {
                        resolve(_addEngines(engine.engines, id))
                    })
                }else{
                    resolve(_addEngines(engine.engines, id))
                }
            })
        })
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
        return new Promise((resolve, reject) => {
            let id = _nextItemId()
            chrome.contextMenus.create({
                'id': id,
                'title' :  "Open all",
                'contexts' :  ['selection'],
                'parentId' : parentItem,
            }, function(){
                _registerOnClick(id, function(info, tab){
                    _onOpenAll(engine, info, tab);
                })
                resolve(
                    _addSeparatorItem(engine, parentItem)
                )
            });

        })
    }


    function _removeRootItem(){
        return new Promise((resolve, reject) => {
            chrome.contextMenus.removeAll(() => {
                resolve()
            })
        })
    }

    function _createRootItem(){
        return new Promise((resolve, reject) => {
            _removeRootItem().then(() => {
                chrome.contextMenus.create({
                    'id': _rootItem,
                    'title' : 'Search',
                    'contexts' : ['selection']
                }, () => {
                    resolve()
                })
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

    function _registerIconItem(id, engine){
        _iconMenuIds.push(id);
    }
}


