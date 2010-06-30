
var G_POPUP = new PopUp();
var G_ENGINE_EDITOR = new EngineEditor();

chrome.extension.sendRequest({}, function(response){

	Common.setStyleSheet(response.default_style);

	if(response.extra_style)
		Common.setStyleSheet(response.extra_style);

	G_POPUP.setOptions(response.options);

	for (i in response.searchEngines){
		var en = response.searchEngines[i];
		G_POPUP.addSearchEngine(en);
	}

	if(response.options.activator == 'auto')
		G_POPUP.setActivator(new AutoActivator(G_POPUP));
	else
		G_POPUP.setActivator(new ClickActivator(G_POPUP));

	G_POPUP.bindEvents();
});

