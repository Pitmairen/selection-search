
/**
 * Since the beginning the data has been stored in localStorage, 
 * this has worked well, but can in some cases cause the data to 
 * be cleared when the users clears browser cache, at least on 
 * firefox.
 * 
 * So to fix this the data has been moved to chrome.storage.local.
 * 
 * To not make too many changes at once, this syncer keeps the 
 * chrome.storage.local and the Storage data in sync, so that the
 * Storage api works almost as before.
 * 
 * The init function loads the current data from chrome.storage.local 
 * and initializes the store with this data.
 * 
 * Also setup a listener on chrome.storage.local to detect changes 
 * to the local store and update the memory storage object with 
 * the changed values to keep the memory storage object in sync
 * with chrome.storage.local.
 */

function storageLocalSyncInit(storage){

    chrome.storage.onChanged.addListener(function(changes, type){

        if(type != 'local')
            return;
        
        let payload = {}
        for(let key in changes){
            payload[key] = changes[key].newValue;
        }
        storage.setData(payload);
    });

    return new Promise(function(resolve, reject){
        chrome.storage.local.get(null, (values) => {
            Storage.setData(values);
            Storage.addListener(new _StorageLocalSyncer());
            resolve(values)
        });
    });
}

/* Reloads and updates the storage object with data from storage.local */
function storageLocalRefresh(storage){
    return new Promise(function(resolve, reject){
        chrome.storage.local.get(null, (values) => {
            storage.setData(values);
            resolve()
        });
    });
}


// Listens on the storage object to save new values 
// to the chrome.storage.local
function _StorageLocalSyncer(){

    this.valueChanged = function(key, value){
        let payload = {}
        payload[key] = value;
        chrome.storage.local.set(payload);
    }

    this.valueRemoved = function(key){
        chrome.storage.local.remove(key);
    }
}