
/**
 * Used to track the number of clicks on each search engine.
 *
 * Currenlty it uses the search url to keep track of the count. 
 * If there are multiple search engines with the same url a click on 
 * one of them will increment the count of both.
 *
 */
function ClickCounter(){

    var STORE_KEY = 'click-count';

    var clicks = {};


    this.sortEngines = function(engines){
        return _sortEnginesByClickCount(engines.slice());
    }

    // Remove old entries from the storage
    this.cleanupStorage = function(engines){
        _doCleanup(engines);
    }

    this.clicked = function(engine){
        var key = _getKey(engine);
        if(!(key in clicks)){
            clicks[key] = 0;
        }
        clicks[key] += 1;

        _updateStorage();
    }


    function _getKey(engine){
        if(engine.is_submenu){
            return engine.name + engine.url;
        }
        return engine.url;
    }

    function _getClickCount(engine){
        var key = _getKey(engine);
        if(!(key in clicks)){
            return 0;
        }
        return clicks[key];
    }

    function _loadFromStorage(){
        var value = localStorage[STORE_KEY] || '{}';
        return JSON.parse(value);
    }

    function _updateStorage(){
        localStorage[STORE_KEY] = JSON.stringify(clicks);
    }



    function _sortEnginesByClickCount(engines){

        var separators = [];
        for(var i=0; i < engines.length; i++){
            var en = engines[i];
            if(en.is_submenu){
                _sortEnginesByClickCount(en.engines);
            }
            else if(en.is_separator){
                // Remove and keep track of the separators so that
                // we can insert them at the correct position again 
                // after the sorting.
                var el = engines.splice(i, 1)[0];
                // Because i is decremented by one for each separator we
                // add the number of separators to the index so that
                // we get the correct index.
                separators.push([i + separators.length, el]);
                i--;
            }
        }

        engines.sort(function(en_a, en_b){
            var a = _getClickCount(en_a);
            var b = _getClickCount(en_b);
            return b - a;
        });

        // Insert the separators again
        for(var i in separators){
            engines.splice(separators[i][0], 0, separators[i][1]);
        }

        return engines;
    }


    function _doCleanup(engines){

        var storedKeys = new Set(Object.keys(clicks));
        _doCleanupRecursive(storedKeys, engines);

        storedKeys.forEach(function(value){
            delete clicks[value];
        });

        _updateStorage();
    }

    function _doCleanupRecursive(storedKeys, engines){
        for(var i=0; i < engines.length; i++){
            var en = engines[i];
            var key = _getKey(en);
            if(storedKeys.has(key)){
               storedKeys.delete(key);
            }
            if(en.is_submenu){
                _doCleanupRecursive(storedKeys, en.engines);
            }
        }
    }

    clicks = _loadFromStorage();
}

