

var Sync = new function(){


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

		var opts = storage.getSyncOptions();

		var data = {}

		if(opts.sync_engines)
			data.engines = _getEnginesToSave(storage);
		if(opts.sync_settings)
			data.settings = storage.getOptions();
		if(opts.sync_style)
			data.style = storage.getStyle();

		if($.isEmptyObject(data))
			return;


		chrome.storage.sync.set(data, function(){

			if(chrome.runtime.lastError == undefined)
				return;

			storage.setSyncOptions({
				sync_engines : false,
				sync_settings: false,
				sync_style : false
			});

			var notification = webkitNotifications.createNotification(
			  'icon48.png',
			  'Synchronization Error',
			  'Failed to synchronize you settings. Sync has been disabled. ('+chrome.runtime.lastError['message']+')'
			);

			notification.show();


		});


	}

	this.loadStorage = function(storage, items){


		var opts = storage.getSyncOptions();

		if(items.hasOwnProperty('engines') && opts.sync_engines)
		{
			storage.setSearchEngines(_getEnginesToLoad(storage, items.engines));
		}

		if(items.hasOwnProperty('settings') && opts.sync_settings)
		{
			storage.setOptions(items.settings);
		}

		if(items.hasOwnProperty('style') && opts.sync_style)
		{
			storage.setStyle(items.style);
		}


	}

	this.updateStorage = function(storage, changes){

		var opts = storage.getSyncOptions();

		if(changes.hasOwnProperty('engines') && opts.sync_engines)
		{
			storage.setSearchEngines(_getEnginesToLoad(storage, changes.engines.newValue));
		}

		if(changes.hasOwnProperty('settings') && opts.sync_settings)
		{
			storage.setOptions(changes.settings.newValue);
		}

		if(changes.hasOwnProperty('style') && opts.sync_style)
		{
			storage.setStyle(changes.style.newValue);
		}


	}



}

