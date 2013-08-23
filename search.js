
var G_POPUP = null;
var G_ENGINE_EDITOR = null;

(function(){

	var exclude = {
				'acid3.acidtests.org':1
	};


	if(document.location.hostname in exclude)
		return;



	Common.init();

	G_POPUP = new PopUp();


	chrome.extension.sendRequest({fromContentScript:true}, function(response){


		if(document.location.hostname != 'mail.google.com'){

			G_ENGINE_EDITOR = new EngineEditor();

			if(!response.options.disable_formextractor)
				initFormExtractor();
		}

		Common.setStyleSheet(response.default_style);

		if(response.extra_style){

			if(response.options.remove_icons == 'https' && location.href.substr(0, 5) == 'https' && response.options.use_default_style)
				;
			else
				Common.setStyleSheet(response.extra_style);
		}

		if(response.options.activator == 'disabled'){

			return;
		}


		G_POPUP.setOptions(response.options);
		var separate_menus = response.options.separate_menus;
		for (i in response.searchEngines){
			var en = response.searchEngines[i];
			if(separate_menus && en.hide_in_popup)
				continue;
			G_POPUP.addSearchEngine(en);
		}

		if(response.options.activator == 'auto')
			G_POPUP.setActivator(new AutoActivator(G_POPUP));
		else if(response.options.activator == 'k_and_m')
			G_POPUP.setActivator(new KeyAndMouseActivator(G_POPUP));
		else
			G_POPUP.setActivator(new ClickActivator(G_POPUP));


		if(response.options.open_on_dblclick){
			var a = new DoubleClickActivator(G_POPUP);
			a.setup();
		}

		G_POPUP.bindEvents();
	});





})();
