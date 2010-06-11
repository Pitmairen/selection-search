
(function(){

var editor_container = $('<div id="search-engine-editor" style="display: none;"></div>');

var editor = $('<div style="display: none;"></div>');
var loading = $('<div></div>');
var error_msg = $('<p style="display: none; color: #CB4345;"></p>');

var name_edit = $('<input type="text" />');
var url_edit = $('<input type="text" />');
var icon_edit = $('<input type="text" />');
var save_button = $('<input type="button" value="Save" />');
var cancel_button = $('<input type="button" value="Cancel" />');



editor.append('<span>Name:</span>');
editor.append(name_edit);
editor.append('<span>Url:</span>');
editor.append(url_edit);
editor.append('<span>Icon url:</span>');
editor.append(icon_edit);

editor_container.append('<h4 style="background: url(\''+chrome.extension.getURL('icon16.png')+'\') no-repeat right top;">Add search engine</h4>');
editor_container.append(editor);
editor_container.append(loading);
editor_container.append(error_msg);
editor_container.append(save_button).append(cancel_button);
//$('<p style="text-align: right; margin: 0;"></p>')

loading.css({
	'background' : 'url("'+chrome.extension.getURL('ajax-loader.gif')+'") no-repeat center center',
	'height' : '50px', 'width' : '100%',
});



$('head').append('<style type="text/css">'+
'#search-engine-editor{display: none; position: absolute; font-size: 9pt;'+
'width: 35em; background: #EDEDED;'+
'border: 1px solid #CECECE; -webkit-border-radius: 5px; -webkit-box-shadow: 1px 1px 6px #BFBFBF;'+
'padding: 0.5em;'+
'} '+
'#search-engine-editor input[type=\'text\']{ width: 100%; margin-bottom: 0.5em; display: block; border: 1px solid #A1A1A1; -webkit-border-radius: 2px;} '+
'#search-engine-editor input[type=\'button\']{ width: auto; display: inline; margin-top: 0.5em;} '+
'#search-engine-editor h4{ margin: 0; font-size: 10pt; padding-bottom: 0.3em; margin-bottom: 0.5em; border-bottom: 1px solid #CECECE;} '+
'</style>');


$('body').append(editor_container);


function showEditorContainer(x, y){

	editor_container.css({'top' : y+'px', 'left' : x+'px'});
	

	save_button.attr('disabled', true);
	loading.show();
	editor.hide();
	error_msg.hide();
	editor_container.show(200);
}
function hideEditorContainer(){
	editor_container.hide(100);
}
function showEditor(en){

	name_edit.val(en.name);
	url_edit.val(en.url);
	icon_edit.val(en.icon_url || '');



	save_button.attr('disabled', false);
	loading.hide();
	error_msg.hide();
	editor.show(200);
}
function showError(msg){
	loading.hide();
	editor.hide();
	error_msg.text(msg);
	error_msg.show(200);
}


cancel_button.click(function(){
	OpenSearch.cancelReq();
	hideEditorContainer();
});
save_button.click(function(){
	hideEditorContainer();
	var en = {
		'name': name_edit.val(),
		'url' : url_edit.val(),
	}

	if(en.name && en.url){

		if(icon_edit.val())
			en['icon_url'] = icon_edit.val();

		chrome.extension.sendRequest({'action' : 'saveEngine', 'engine' : en});

		//popup is from search.js
		popup.addSearchEngine(en);
	}
});

function loadOpenSearch(url){

	OpenSearch.getEngineFromURL(url, function(status, engine, error){

		if(status == 'OK'){
			showEditor(engine);
		}
		else
			showError(error);

	});

}





$('a[onClick^=addOpenSearch]').each(function(){

	var adder = $(this).attr('onclick').toString();

	var match = adder.match(/'(.*?)'/gi);

	var params = null;
	if(match){
		params = $.map(match, function(m){
			return m.slice(1, -1);
		});
	}

	if(!params || params.length != 5 || params[4] != 'g'){

		// Add a placeholder for the image so the alignment look good
		$(this).before('<span style="display: inline-block; width: 16px; height: 16px; margin: 0 8px;"></span>');

		return true;
	}



	$(this).before(
		$('<a href="#"></a>').append(
			$('<img class="icon" alt="Add to Chrome Selection Search" title="Add to Chrome Selection Search" />').attr('src', chrome.extension.getURL('icon16.png')).css({
				'margin' : '0 8px',
				'width' : '16px', 'hwight' : '16px',
			})
		).click(function(e){

			showEditorContainer(e.pageX, e.pageY-50);

			
			loadOpenSearch("http://mycroft.mozdev.org/installos.php/" + params[3] + "/" + params[0] + ".xml");
			return false;
		})
	);
});


$('a[onClick^=addEngine]').each(function(){

	$(this).before('<span style="display: inline-block; width: 16px; height: 16px; margin: 0 8px;"></span>');
});

$('#NOTES-table .NOTEheader').after(
	$('<tr class="NOTEbody"><td><img class="icon" title="Chrome Selection Search" width="16px" height="16px" src="'+chrome.extension.getURL('icon16.png')+'" />'+
	' Add search engine to Chrome <a href="https://chrome.google.com/extensions/detail/gipnlpdeieaidmmeaichnddnmjmcakoe">Selection Search</a> extension.</td></tr>')
);


})();