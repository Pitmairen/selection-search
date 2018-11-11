
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




$('a[onClick^=addOpenSearch]').each(function(){

	var adder = $(this).attr('onclick').toString();

	var match = adder.match(/'(.*?)'/gi);

	var params = null;
	if(match){
		params = $.map(match, function(m){
			return m.slice(1, -1);
		});
	}

	if(!params || params.length != 5 || (params[4] != 'g' && params[4] != 'p')){

		// Add a placeholder for the image so the alignment look good
		$(this).before('<span style="display: inline-block; width: 16px; height: 16px; margin: 0 8px;"></span>');

		return true;
	}



	$(this).before(
		$('<a href="#"></a>').append(
			$('<img class="icon" alt="Add to Firefox Selection Search" title="Add to Firefox Selection Search" />').attr('src', chrome.extension.getURL('img/icon16.png')).css({
				'margin' : '0 8px',
				'width' : '16px', 'hwight' : '16px',
			})
		).click(function(e){

			engineEditor.show(e.pageX, e.pageY-50);


			loadOpenSearch(engineEditor, "https://mycroftproject.com/installos.php/" + params[3] + "/" + params[0] + ".xml");
			return false;
		})
	);
});


$('a[onClick^=addEngine]').each(function(){

	$(this).before('<span style="display: inline-block; width: 16px; height: 16px; margin: 0 8px;"></span>');
});

$('table.altrowgw:last tr:first-child').after(
	$('<tr><td><img class="icon" title="Firefox Selection Search" width="16px" height="16px" src="'+chrome.extension.getURL('img/icon16.png')+'" />'+
	' Add search engine to the Firefox <a href="https://addons.mozilla.org/en-US/firefox/addon/selection-search-ff/">Selection Search</a> extension.</td></tr>')
);


})();
