
function EngineEditor(_shadowDOM){

	// FIREFOX-BUG?: Depending on the sites Content Security Policy, the
	// styles that was previously set using inline style attributes when
	// creating the element would sometimes be blocked.
	// Setting the style with javascript after the element has been
	// created seems to work.

	var _editorContainer = $('<div></div>')
		.attr('class', 'engine-editor common')
		.css({display: 'none', position: 'absolute'});

	var _editor = $('<div></div>')
				.css({display: 'none'});
	var _loading = $('<div></div>')
				.css({display: 'none'});
	var _errorMsg = $('<p></p>')
				.css({display: 'none', color: '#CB4345'});

	var _nameEdit = $('<input type="text" />');
	var _urlEdit = $('<input type="text" />');
	var _iconEdit = $('<input type="text" />');
	var _saveButton = $('<input type="button" value="Save" />');
	var _cancelButton = $('<input type="button" value="Cancel" />');

	var _postForm = false;

	var _that = this;


	_editor.append('<span>Name:</span>');
	_editor.append(_nameEdit);
	_editor.append('<span>Url:</span>');
	_editor.append(_urlEdit);
	_editor.append('<span>Icon url:</span>');
	_editor.append(_iconEdit);



	var _titleBar = $('<h4></h4>')
		.css({
			paddingLeft: '20px',
			background: 'url(\''+chrome.extension.getURL('img/icon16.png')+'\') no-repeat left top'
		})
		.append(
			$('<input class="close" type="button" value="" />')
			.css({background: 'url(\''+chrome.extension.getURL('img/close.png')+'\') no-repeat center center'})
		)
		.append($('<span class="title">Add search engine</span>'));

	_editorContainer.append(_titleBar);
	_editorContainer.append(_editor);
	_editorContainer.append(_loading);
	_editorContainer.append(_errorMsg);
	_editorContainer.append(_saveButton).append(_cancelButton);

	_loading.css({
		'background' : 'url("'+chrome.runtime.getURL('img/ajax-loader.gif')+'") no-repeat center center',
		'height' : '50px', 'width' : '100%',
	});

	$(_shadowDOM).append(_editorContainer);

	_titleBar.find('.close').click(function(){
		_that.hide();
	});
	_cancelButton.click(function(){
		_that.hide();
	});
	_saveButton.click(function(){
		_that.hide();
		var en = {
			'name': _nameEdit.val(),
			'url' : _urlEdit.val(),
		}

		if(_postForm)
			en.post = true;

		if(en.name && en.url){

			if(_iconEdit.val())
				en['icon_url'] = _iconEdit.val();

			chrome.runtime.sendMessage({'action' : 'saveEngine', 'engine' : en});

			//G_POPUP is from search.js
			// G_POPUP.addSearchEngine(en);
		}
	});


	this.show = function(x, y){

		// var pos = Common.calculateWindowPosition(_editorContainer, x, y);

		_editorContainer.css({'top' : y+'px', 'left' : x+'px'});
        Positioning.checkPosition(_editorContainer[0], null);

		_saveButton.attr('disabled', true);
		_loading.show();
		_editor.hide();
		_errorMsg.hide();
		_editorContainer.show(200);
	}

	this.hide = function(){
		// $(_editorContainer).hide(100);
        _editorContainer[0].style.display = "none";
	}

	this.load = function(en){

		_nameEdit.val(en.name);
		_urlEdit.val(en.url);
		_iconEdit.val(en.icon_url || '');

		_postForm = en.post || false;


		_saveButton.attr('disabled', false);
		_loading.hide();
		_errorMsg.hide();
		_editor.show(200);
	}

	this.showError = function(msg){
		_loading.hide();
		_editor.hide();
		_saveButton.attr('disabled', true);
		_errorMsg.text(msg);
		_errorMsg.show(200);
	}

}
