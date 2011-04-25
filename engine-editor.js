
function EngineEditor(){

	var _editorContainer = $('<div style="display: none; position: absolute; z-index: 9999;"></div>')
		.attr('id', Common.getId('engine-editor'))
		.attr('class', Common.getCommonClass());

	var _editor = $('<div style="display: none;"></div>');
	var _loading = $('<div></div>');
	var _errorMsg = $('<p style="display: none; color: #CB4345;"></p>');

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


	var _titleBar = $('<h4 style="padding-left: 20px; background: url(\''+chrome.extension.getURL('icon16.png')+'\') no-repeat left top;"><input style="background: url(\''+chrome.extension.getURL('close.png')+'\') no-repeat center center;" class="close" type="button" value="" /><span class="title">Add search engine</span></h4>');
	_editorContainer.append(_titleBar);
	_editorContainer.append(_editor);
	_editorContainer.append(_loading);
	_editorContainer.append(_errorMsg);
	_editorContainer.append(_saveButton).append(_cancelButton);

	_loading.css({
		'background' : 'url("'+chrome.extension.getURL('ajax-loader.gif')+'") no-repeat center center',
		'height' : '50px', 'width' : '100%',
	});

	$('html').append(_editorContainer);

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

			chrome.extension.sendRequest({'action' : 'saveEngine', 'engine' : en});

			//G_POPUP is from search.js
			G_POPUP.addSearchEngine(en);
		}
	});


	this.show = function(x, y){

		var pos = Common.calculateWindowPosition(_editorContainer, x, y);

		_editorContainer.css({'top' : pos.y+'px', 'left' : pos.x+'px'});

		_saveButton.attr('disabled', true);
		_loading.show();
		_editor.hide();
		_errorMsg.hide();
		_editorContainer.show(200);
	}

	this.hide = function(){
		_editorContainer.hide(100);
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