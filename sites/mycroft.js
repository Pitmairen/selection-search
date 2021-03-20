
(function(){


function loadOpenSearch(engineEditor, url){

    OpenSearch.getEngineFromURL(url, function(status, engine, error){

        if(status == 'OK'){
            engineEditor.load(engine);
        }
        else
            engineEditor.showError(error);

    });

}


var shadowElement = document.createElement("div");
var shadowDOM = BrowserSupport.createShadowDOM(shadowElement);

document.documentElement.appendChild(shadowElement);

var style = new Style(shadowDOM);

var engineEditor = new EngineEditor(shadowDOM);
initFormExtractor(engineEditor)

chrome.runtime.sendMessage({action:"getContentScriptData"}, function(response){

    if (BrowserSupport.hasLastError()) {
        return
    }

    style.setDefaultStyle(response.default_style);
    if(response.extra_style)
        style.setCustomStyle(response.extra_style);

});


var foundOpenSearchEngines = false;

$("a[href^='/install.html']").each(function(){

	var installUrl = $(this).attr('href');

	var match = installUrl.match(/id=(\d+)/i);

	var searchId = null;
	if(match){
		searchId = match[1]
	}

	if(!searchId){
		return true;
	}


	$(this).before(
		$('<a href="#"></a>').append(
			$('<img class="icon" alt="Add to Firefox Selection Search" title="Add to Firefox Selection Search" />').attr('src', chrome.extension.getURL('img/icon16.png')).css({
				'margin' : '0 8px 0 3px',
				'width' : '16px', 'height' : '16px',
			})
		).click(function(e){

			engineEditor.show(e.pageX, e.pageY-50);

			loadOpenSearch(engineEditor, "https://mycroftproject.com/installos.php/" + searchId + "/opensearch.xml");
			return false;
		})
	);

	foundOpenSearchEngines = true;
});


if(foundOpenSearchEngines){
	$('table.altrowgw:last tr:first-child').after(
		$('<tr><td><img class="icon" title="Firefox Selection Search" width="16px" height="16px" src="'+chrome.extension.getURL('img/icon16.png')+'" />'+
		' Add search engine to the Firefox <a href="https://addons.mozilla.org/en-US/firefox/addon/selection-search-ff/">Selection Search</a> extension.</td></tr>')
	);
}


})();
