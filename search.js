
var G_POPUP = null;
var G_ENGINE_EDITOR = null;

(function(){


	var exclude = {
				'acid3.acidtests.org':1,
	};


	if(document.location.hostname in exclude)
		return;

	

	Common.init();

	G_POPUP = new PopUp();

	if(document.location.hostname != 'mail.google.com'){

		G_ENGINE_EDITOR = new EngineEditor();

		initFormExtractor();
	}


	chrome.extension.sendRequest({fromContentScript:true}, function(response){



		Common.setStyleSheet(response.default_style);

		if(response.extra_style){

			if(response.options.remove_icons == 'https' && location.href.substr(0, 5) == 'https' && response.options.use_default_style)
				;
			else
				Common.setStyleSheet(response.extra_style);
		}

		if(response.options.activator == 'contextmenu'){

			return;
		}


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





})();