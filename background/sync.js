

const Sync = new function(){


    function _getEnginesToSave(storage)
    {
        var engines = storage.getSearchEngines();

        var ret = [];
        for(i in engines){

            var en  = engines[i];

            if(!en.nosync)
                ret.push(en);

        }
        return ret;
    }

    function _getEnginesToLoad(storage, newengines)
    {
        var engines = storage.getSearchEngines();

        var nosync = [];
        for(var i in engines){
            var en  = engines[i];
            if(en.nosync)
                nosync.push([i, en]);
        }

        var ret = newengines;

        for(var i in nosync){
            var en = nosync[i];
            ret.splice(en[0], 0, en[1]);
        }

        return ret;
    }

    this.saveStorage = function(storage){

        let opts = storage.getSyncOptions();

        let data = {}

        if(opts.sync_engines){
            var engines = _getEnginesToSave(storage);

            var chunks = _splitSearchEnginesIntoChunks(engines);

            data = {...data, ...chunks};

        }
        if(opts.sync_settings){
            data.settings = storage.getOptions();
            data.blacklist = storage.getBlacklistDefinitions();
        }
        if(opts.sync_style){
            data.style = storage.getStyle();
            data.toolbarStyle = storage.getToolbarStyle();
        }

        if(Object.keys(data).length === 0)
            return;


        chrome.storage.sync.set(data, function(){

            if(!BrowserSupport.hasLastError())
                return;

            storage.setSyncOptions({
                sync_engines : false,
                sync_settings: false,
                sync_style : false
            });

            chrome.notifications.create({
                type: 'basic',
                iconUrl: '/img/icon48.png',
                title: 'Synchronization Error',
                message: 'Failed to synchronize you settings. Sync has been disabled. ('+chrome.runtime.lastError['message']+')'
            });

        });


    }

    this.loadStorage = function(storage, items){

        var opts = storage.getSyncOptions();

        if(opts.sync_engines){

            if(items.hasOwnProperty('engines_chunk_count') && items.engines_chunk_count > 0){
                var synced_engines = _getChunkedEngines(items);
                storage.setSearchEngines(_getEnginesToLoad(storage, synced_engines));
            }
            else if(items.hasOwnProperty('engines'))
                storage.setSearchEngines(_getEnginesToLoad(storage, items.engines));

        }

        if(items.hasOwnProperty('settings') && opts.sync_settings)
        {
            storage.setOptions(items.settings);
        }

        if(items.hasOwnProperty('blacklist') && opts.sync_settings)
        {
            storage.setBlacklistDefinitions(items.blacklist);
        }

        if(items.hasOwnProperty('style') && opts.sync_style)
        {
            storage.setStyle(items.style);
        }

        if(items.hasOwnProperty('toolbarStyle') && opts.sync_style)
        {
            storage.setToolbarStyle(items.toolbarStyle);
        }


    }

    this.updateStorage = function(storage, changes){

        var opts = storage.getSyncOptions();


        if(changes.hasOwnProperty('settings') && opts.sync_settings)
        {
            storage.setOptions(_getNewValueOrDefault(changes.settings, {}));
        }

        if(changes.hasOwnProperty('blacklist') && opts.sync_settings)
        {
            storage.setBlacklistDefinitions(_getNewValueOrDefault(changes.blacklist, []));
        }

        if(changes.hasOwnProperty('style') && opts.sync_style)
        {
            storage.setStyle(_getNewValueOrDefault(changes.style, ''));
        }

        if(changes.hasOwnProperty('toolbarStyle') && opts.sync_style)
        {
            storage.setToolbarStyle(_getNewValueOrDefault(changes.toolbarStyle, ''));
        }

        if(opts.sync_engines){

            if(changes.hasOwnProperty('engines')){
                storage.setSearchEngines(_getEnginesToLoad(storage, _getNewValueOrDefault(changes.engines, [])));
            }
            else{

                var chunks = Object.keys(changes).filter(function(value,index){
                    return value.startsWith('engines_chunk_');
                });

                if(chunks.length > 0){
                    _reloadFromSync(storage);
                }

            }



        }
    }

    function _getNewValueOrDefault(option, default_value){
        if(option.newValue === undefined){
            return default_value;
        }
        return option.newValue;
    }

    function _getChunkedEngines(sync_items)
    {

        var count = sync_items.engines_chunk_count;

        var chunks = [];

        for(var i=0; i < count; i++){

            var key = 'engines_chunk_' + i;

            if(sync_items.hasOwnProperty(key)){
                chunks.push(sync_items[key]);
            }
        }


        try{
            var engines = JSON.parse(chunks.join(''));
        }
        catch(e){
            chrome.notifications.create({
                type: 'basic',
                iconUrl: '/img/icon48.png',
                title: 'Synchronization Error',
                message: 'Failed to parse chunked search engines ('+e+')'
            });
            return [];

        }

        return engines;

    }

    function _reloadFromSync(storage)
    {

        chrome.storage.sync.get(null, function(items){

            if(BrowserSupport.hasLastError()){

                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: '/img/icon48.png',
                    title: 'Synchronization Error',
                    message: 'Failed to update synced settings ('+chrome.runtime.lastError['message']+')'
                });
                return;
            }

            Sync.loadStorage(storage, items);

        });

    }


    function _splitSearchEnginesIntoChunks(original_engines)
    {
        var engines_string = JSON.stringify(original_engines);
        var len = engines_string.length;

        if(len < 4000){

            // try to remove some old values if they are present.
            chrome.storage.sync.remove(
                [0,1,2,3,4,5,6,7,8,9].map(function(i){return 'engines_chunk_'+i})
            );

            return {'engines' : original_engines, 'engines_chunk_count' : 0}
        }


        // the string will be converted to json when stored, so the string
        // will be double stringified. The length of the string will be
        // longer so we check the difference in length.
        var diff = len / JSON.stringify(engines_string).length;

        var chunk_size = Math.floor(4000 * diff) - 50;

        var re = new RegExp(".{1,"+chunk_size+"}","g");

        var chunks = engines_string.match(re);

        var ret = {'engines_chunk_count' : chunks.length};

        for(var i=0; i<chunks.length; ++i){
            ret['engines_chunk_'+i] = chunks[i];
        }

        return ret;

    }



}

