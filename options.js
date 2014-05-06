
Storage.storage_upgrades();

var ACTIVATORS = {
	'disabled' : 'Disabled',
	'click' : 'Mouse Click',
	'auto' :  'Auto',
// 	'contextmenu' : 'Context Menu',
	'k_and_m' : 'Keyboard shortcut + Mouse click'
}

var CONTEXTMENU_OPTIONS = {
	'disabled' : 'Disabled',
	'enabled' :  'Enabled'
}
var _G_folder_id_count = 0;
var _G_engine_id_count = 0;


function addNewEngine(en, level){

	++_G_engine_id_count;


	if(en.is_separator){
		return _addSeparator(en, level);
	}

	var name = en.name,
		url = en.url,
		icon_url = en.icon_url,
		post = en.post || false,
		is_folder = en.is_submenu || false;

	level = level || 0;

	icon_url = icon_url == undefined ||
				icon_url.length == 0 ? '(Use default)' : icon_url;

	var tr = $('<tr></tr>');

	tr.append($('<td class="drag-target"></td>').css('background', 'url("'+chrome.extension.getURL('move.png')+'") no-repeat center center'));
	tr.append($('<td></td>').append($('<input class="name" type="text" />').val(name)));


	var _url = $('<input class="url" type="text" />');
	if(!is_folder)
		_url.val(url)
	else
		_url.val('Submenu').attr('disabled', true);

	tr.append($('<td></td>').append(_url));
	tr.append($('<td></td>').append($('<input class="icon_url" type="text" />').val(icon_url)));

	tr.find('input.icon_url').focus(function (){

		if ($(this).val() == '(Use default)')
			$(this).val('');

	}).blur(function (){

		if (!$(this).val())
			$(this).val('(Use default)');

	});


	_addEngineOptions(en, tr);

	Reorder.makeMovable(tr);


	$('#engines').append(tr);

	tr.data('level', level);


	if(!is_folder){

		tr.attr('id', 'search-engine-'+(_G_engine_id_count));
		tr.addClass('search-engine');
		Reorder.initElements(tr);

		return;
	}

	tr.addClass('menu-folder');

	var id = 'folder-'+(++_G_folder_id_count);
	tr.attr('id', id);


	var engines = en.engines || [];

	for(var i=0,e=engines.length; i<e; ++i){
		addNewEngine(engines[i], level+1);
	}



	var end = $('<tr id="end-'+id+'" class="menu-folder-end"><td></td><td colspan="5"></td></tr>').data('level', level+1);


	Reorder.initElements(tr);
	Reorder.initElements(end);

	$('#engines').append(end);


}


function _addSeparator(en, level){

	var tr = $('<tr class="menu-separator"></tr>');

	tr.append($('<td class="drag-target"></td>').css('background', 'url("'+chrome.extension.getURL('move.png')+'") no-repeat center center'));


	tr.append('<td colspan="3"><div class="separator-bg"></div></td>').data('level', level);

	_addEngineOptions(en, tr);


	Reorder.initElements(tr);
	Reorder.makeMovable(tr);
	$('#engines').append(tr);


}

function _addEngineOptions(en, tr){


	var options_popup = $('<div class="engine-options-popup"></div>');


	options_popup.append($('<a href="#" class="close-popup"></a>').click(function(){

			options_popup.fadeOut(100);
			return false;

		})
	);


	if(!en.is_submenu && !en.is_separator)
		options_popup.append('<label for="engine-opt-post-'+_G_engine_id_count+'">Use POST method</label><input class="post" id="engine-opt-post-'+_G_engine_id_count+'" type="checkbox" /><hr />');

	options_popup.append('<p><strong>Show in:</strong></p>');

	options_popup.append('<p><input class="hide_in_ctx" id="engine-opt-ctx-'+_G_engine_id_count+'" type="checkbox" /> <label for="engine-opt-ctx-'+_G_engine_id_count+'">Context menu</label></p>');
	options_popup.append('<p><input class="hide_in_popup" id="engine-opt-popup-'+_G_engine_id_count+'" type="checkbox" /> <label for="engine-opt-popup-'+_G_engine_id_count+'">Popup</label></p>');
	options_popup.append('<p class="separate-menus-msg">This only has effect when the "Separate search engines" option is checked below in "Other Options" section.</p>');

	if(!en.is_submenu && !en.is_separator){

		var hide_on_click = '<input class="hide_on_click" id="engine-opt-hide-on-click-'+_G_engine_id_count+'" type="checkbox" /> <label for="engine-opt-hide-on-click-'+_G_engine_id_count+'">Hide menu on click<p>';

		options_popup.append('<hr>').append(hide_on_click).append('<p class="separate-menus-msg">The menu will be hidden after clicking this search engine.</p>');

	}


	if(en.is_submenu){

		var hide_menu = $('<input class="hidemenu" id="engine-opt-hidemenu-'+_G_engine_id_count+'" type="checkbox" />');

		var hide_menu_wrap = $('<div style="padding-left: 0.5em;"></div>').append(hide_menu);
		hide_menu_wrap.append('<label for="engine-opt-hidemenu-'+_G_engine_id_count+'">Don\'t show menu</label>').append('<p class="separate-menus-msg">When this is checked the submenu will not open on mouse over. It will just open all searches inside on click.</p>');


		var hide_on_click = '<input style="margin-top: 0.8em;" class="hide_on_click" id="engine-opt-hide-on-click-'+_G_engine_id_count+'" type="checkbox" /> <label for="engine-opt-hide-on-click-'+_G_engine_id_count+'">Hide menu on click<p>';

		hide_menu_wrap.append(hide_on_click).append('<p class="separate-menus-msg">The menu will be hidden after clicking this submenu</p>');


		var open_all = $('<input class="openall" id="engine-opt-openall-'+_G_engine_id_count+'" type="checkbox" />').change(function(){

			hide_menu_wrap.toggle($(this).is(':checked'));
		});


		options_popup.append('<hr />').append(open_all).append('<label for="engine-opt-openall-'+_G_engine_id_count+'">Open all on click</label>');
		options_popup.append('<p class="separate-menus-msg" style="margin-bottom: 0.8em;">When this is checked all search engines in this submenu will be opened at once.</p>');
		options_popup.append(hide_menu_wrap.hide());


		if(en.openall){
			open_all.attr('checked', true).change();

			hide_menu.attr('checked', en.hidemenu);
		}
	}


	var enable_sync = $('<input class="nosync" id="engine-opt-sync-'+_G_engine_id_count+'" type="checkbox" />');

	options_popup.append('<hr />').append(enable_sync).append('<label for="engine-opt-sync-'+_G_engine_id_count+'">Synchronize</label>');


	if(!en.hide_in_popup){
		options_popup.find('.hide_in_popup').attr('checked', true);
	}
	if(!en.hide_in_ctx){
		options_popup.find('.hide_in_ctx').attr('checked', true);
	}
	if(!en.nosync){
		options_popup.find('.nosync').attr('checked', true);
	}
	if(en.post){
		options_popup.find('.post').attr('checked', true);
	}
	if(en.hide_on_click){
		options_popup.find('.hide_on_click').attr('checked', true);
	}

	var opt_link = $('<a href="#" class="engine-opts-link">&nbsp;</a>').hover(

		function(){
			$(this).parent().parent().addClass('options-hover');
		},
		function(){
			$(this).parent().parent().removeClass('options-hover');
		}
	).click(function(){

		$('.engine-options-popup').not(options_popup).hide();

		var x = $(this).offset().left - options_popup.outerWidth()-4;
		var y = $(this).offset().top;

		options_popup.css({top:y+'px', left:x+'px'});
		options_popup.fadeToggle(100);
		return false;
	});

	tr.append($('<td class="engine-options"></td>').append(opt_link).append(options_popup.hide()));




	tr.append($('<td></td>').append($('<a href="#" class="delete">X</a>').hover(

		function(){
			$(this).parent().parent().addClass('options-hover');
		},
		function(){
			$(this).parent().parent().removeClass('options-hover');
		}

	).click(function(){

		var tr = $(this).parent().parent();

		if(tr.hasClass('menu-folder')){

			var elms = tr.nextUntil('#end-'+tr.attr('id'));

			$('#end-'+tr.attr('id')).remove();


			elms.each(function(){$(this).data('level', $(this).data('level')-1);});

			Reorder.initElements(elms);


		}

		tr.remove();
		return false;
	})


	));


}

$(document).ready(function(){

	Common.init();

	var popup = new PopUp();


	// The style system has changed.
	// Check if the user has changed the style. If it hasn't we can clear the stored style.
	var stored_style = Storage.getStyle('');
	if (stored_style == $('#old-default-style').val())
		Storage.setStyle('');

	var CURRENT_STYLE = '';
	var hotkey_editor = null;

	chrome.runtime.sendMessage({}, function(response){

		popup.setOptions(response.options);
		Common.setStyleSheet(response.default_style);
		if(response.extra_style)
			Common.setStyleSheet(response.extra_style);

		for (i in response.searchEngines){
			var en = response.searchEngines[i];

			if(i < 3) // add 3 engines for preview
				popup.addSearchEngine(en);


			addNewEngine(en, 0);
		}


		if(response.extra_style){

			CURRENT_STYLE= response.extra_style;
			$('#select_theme').prepend('<option selected="selected" value="current_style">&lt;Current Style&gt;</option>');
		}

		$('#preview').append(popup.getForPreview());
		$('#preview-button').append(popup.getButtonForPreview());


		$("input[name='button']").filter("[value="+response.options.button+"]").attr('checked', true);

		$("input[name='newtab']").attr('checked', response.options.newtab);
		$("input[name='background_tab']").attr('checked', response.options.background_tab);

		$("input[name='show_in_inputs']").attr('checked', response.options.show_in_inputs);
		$("input[name='hide-on-click']").attr('checked', response.options.hide_on_click);
		$("input[name='disable-effects']").attr('checked', response.options.disable_effects);

		$("#select_activator option[value='"+response.options.activator+"']").attr('selected', true);
		$("#select_activator").change();

		$('#select_theme').change();


		$('input[name=remove_icons][value='+response.options.remove_icons+']').attr('checked', true).change();
		$('input[name=use_default_style]').attr('checked', response.options.use_default_style);


		hotkey_editor = HotKeys.createHotkeyInput('#k_and_m_keys', response.options.k_and_m_combo.slice(0, -1));
		$("#k_and_m_button").val(response.options.k_and_m_combo[response.options.k_and_m_combo.length-1]);



		$("#contextmenu_option option[value='"+response.options.context_menu+"']").attr('selected', true);
		$("#contextmenu_option").change();


		$("#opt-separate-engines").attr('checked', response.options.separate_menus).change();

		$("#opt-disable-extractform").attr('checked', response.options.disable_formextractor);

		$("#opt-open-on-dblclick").attr('checked', response.options.open_on_dblclick);
		$("#opt-open-new-tab-last").attr('checked', response.options.open_new_tab_last);

		$("#opt-sync-engines").attr('checked', response.sync_options.sync_engines);
		$("#opt-sync-settings").attr('checked', response.sync_options.sync_settings);
		$("#opt-sync-style").attr('checked', response.sync_options.sync_style);


	});


	$('#search-icon').append('<img src="'+chrome.extension.getURL('icon16.png')+'" width="16px" height="16px" />');

	$('#new-engine').click(function(){

		addNewEngine({name:'', url:'', icon_url:''}, 0);

		return false;
	});

	$('#new-folder').click(function(){
		addNewEngine({name:'New Submenu', url:'', icon_url:'', is_submenu:true}, 0);

		return false;
	});

	$('#new-separator').click(function(){
		addNewEngine({is_separator:true}, 0);

		return false;
	});


	$('#save').click(function(){


		var folder_stack = [{engines:[]}]; // folder stack with the root item

		$('#engines tr:gt(0)').each(function(index){

			var en = {};

			$(this).find('input').each(function(){
				if ($(this).attr('type') == 'checkbox')
					en[$(this).attr('class')] = $(this).is(':checked');
				else
					en[$(this).attr('class')] = $(this).val();
			});

			if(en.icon_url == '(Use default)')
				delete en.icon_url;
			if(!en.post)
				delete en.post;

			if(!en.hide_on_click)
				delete en.hide_on_click;

			if(en.hide_in_popup)
				delete en.hide_in_popup;
			else
				en.hide_in_popup = true;

			if(en.hide_in_ctx)
				delete en.hide_in_ctx;
			else
				en.hide_in_ctx = true;

			if(en.nosync)
				delete en.nosync;
			else
				en.nosync = true;


			if($(this).hasClass('menu-folder')){

				if(!en.openall){
					delete en.openall;
					delete en.hidemenu;
					delete en.hide_on_click;
				}
				else if(!en.hidemenu){
					delete en.hidemenu;
				}

				en.is_submenu = true;
				en.engines = [];

				folder_stack[folder_stack.length-1].engines.push(en);
				folder_stack.push(en);

			}
			else if($(this).hasClass('menu-separator')){
				en.is_separator = true;

				folder_stack[folder_stack.length-1].engines.push(en);
			}
			else if($(this).hasClass('menu-folder-end')){
				folder_stack.pop()
// 				current_folder = null;
			}
			else if(en.name && en.url){

				folder_stack[folder_stack.length-1].engines.push(en);
			}
		});

		// When we get here only the root item should vbe left
		var new_engines = folder_stack[0].engines;



		var k_and_m_combo = hotkey_editor.getCombo();
		k_and_m_combo.push(parseInt($("#k_and_m_button").val(), 10));


		Storage.setSearchEngines(new_engines);

		Storage.setStyle(jQuery.trim($('#style').val()));

		Storage.setOptions({
			button: parseInt($("input[name='button']:checked").val(), 10),
			newtab: $("input[name='newtab']").is(':checked'),
			background_tab: $("input[name='background_tab']").is(':checked'),
			activator: $('#select_activator option:selected').first().attr('value'),
			remove_icons:$('input[name=remove_icons]:checked').val(),
			use_default_style: $('input[name=use_default_style]').is(':checked'),
			show_in_inputs: $('input[name=show_in_inputs]').is(':checked'),
			k_and_m_combo:k_and_m_combo,
			context_menu: $('#contextmenu_option option:selected').first().attr('value'),
			separate_menus: $('#opt-separate-engines').is(':checked'),
			hide_on_click: $("input[name='hide-on-click']").is(':checked'),
			disable_formextractor: $('#opt-disable-extractform').is(':checked'),
			open_on_dblclick: $('#opt-open-on-dblclick').is(':checked'),
			open_new_tab_last: $('#opt-open-new-tab-last').is(':checked'),
			disable_effects: $('#opt-disable-effects').is(':checked'),
		});


		Storage.setSyncOptions({
			sync_engines: $('#opt-sync-engines').is(':checked'),
			sync_settings: $("#opt-sync-settings").is(':checked'),
			sync_style: $('#opt-sync-style').is(':checked'),
		});


		chrome.runtime.sendMessage({action:"optionsChanged"});



		location.reload();

	});


	$('#restore').click(function(){


		if(confirm("This will delete all your search engines and reset all the changes you have made")){

			Storage.clear();
			location.reload();
		}
		return false;
	});

	$('#update-preview').click(function(e){

		Common.setStyleSheet($('#style').val());

		return false;
	});

	var theme_select = $('#select_theme');

	$('.theme_def').each(function(){
		theme_select.append('<option value="' + $(this).attr('id')+'">'+$(this).attr('name')+'</option>');
	});

	theme_select.change(function(){

		var opt = $('#select_theme option:selected').first();

		var id = opt.attr('value');

		if(id == 'current_style'){
			Common.setStyleSheet(CURRENT_STYLE)
			$("#style").val(CURRENT_STYLE);
			return;
		}

		var css = $('textarea#' + id).val();

		$("#style").val(css);

		Common.setStyleSheet(css);

	});

	for (var act in ACTIVATORS){

		var name = ACTIVATORS[act];

		$('#select_activator').append('<option value="' + act + '">'+name+'</option>');
	}

	$('#select_activator').change(function(){

		var opt = $('#select_activator option:selected').first();

		var val = opt.attr('value');
		if(val == 'disabled')
			$('#show-advanced-popup-opts').hide();
		else
			$('#show-advanced-popup-opts').show();

		$('.activator_options').hide(100);
		$('#activator_' + opt.attr('value')).show(100);

	});

	for (var act in CONTEXTMENU_OPTIONS){

		var name = CONTEXTMENU_OPTIONS[act];
		$('#contextmenu_option').append('<option value="' + act + '">'+name+'</option>');
	}


	$('#contextmenu_option').change(function(){

		var opt = $('#contextmenu_option option:selected').first();

		var val = opt.attr('value');
		if(val == 'disabled')
			$('#contextmenu_active').hide(100);
		else
			$('#contextmenu_active').show(100);

	});



	$('#show_customize').click(function(){
		$('#customize').toggle();

		return false;
	});


	$('#show_html').click(function(){
		$('#html').toggle();
		return false;
	});


	$('input[name=remove_icons]').change(function(){

		if($(this).val() == 'https')
			$('#use_default_style').show(100);
		else
			$('#use_default_style').hide(100);
	});


	$('#k_and_m_keys').focus(function(){

		var top = $(this).offset().top - $("#hotkey_info").outerHeight() - 5;

		$("#hotkey_info").css({'top' : top+ 'px', 'left' : $(this).offset().left + 'px'});

		$("#hotkey_info").show(100);
	});

	$('#k_and_m_keys').blur(function(){
		$("#hotkey_info").hide(100);
	});



	$('#opt-separate-engines').change(function(){

		$('#wrap-edit-separate-engines').toggle($(this).is(':checked'));

	});



	function _load_export(){


		var to_export = {}

		if($('#export-search-engines').is(':checked'))
			to_export.searchEngines = Storage.getSearchEngines();
		if($('#export-style').is(':checked'))
			to_export.styleSheet =  Storage.getStyle();
		if($('#export-options').is(':checked'))
			to_export.options =  Storage.getOptions();

		if(!jQuery.isEmptyObject(to_export)){

			if(localStorage.hasOwnProperty('VERSION'))
				to_export.VERSION = localStorage['VERSION'];

			to_export = JSON.stringify(to_export);

// 			if($('#encode-output').is(':checked'))

			try{
				to_export = btoa(to_export);
			}catch(e){
				to_export = '1e:' + btoa(encodeURI(to_export));
			}

		}else
			to_export = '';

		$('#export-settings textarea').val(to_export);

	}

	var _import_decoders = {
		'1e' : function(v){return JSON.parse(decodeURI(atob(v)))},
		'1' : function(v){return JSON.parse(atob(v))}
	}


	function _do_import(){


		var to_import = $('#import-settings textarea').val();

		if(to_import.length == 0){
			alert('No data to import');
			return;
		}

		try{

			var parts = to_import.split(':');

			var decoder = '1';

			if(parts.length == 2){
				to_import = parts[1];
				decoder = parts[0];
			}

			if(decoder in _import_decoders)
				to_import = _import_decoders[decoder](to_import);
			else
				to_import = null;

		}catch(err){
			to_import = null;
		}
		if(!to_import || jQuery.isEmptyObject(to_import)){
			alert('Failed to import data');
			return;
		}


		if( !$('#import-search-engines').is(':checked') &&
			!$('#import-style').is(':checked') &&
			!$('#import-options').is(':checked')){
			alert('No data imported');
			return;
		}

		var msg = [];

		if($('#import-search-engines').is(':checked')){

			if(!to_import.hasOwnProperty('searchEngines'))
				msg.push('Search Engines: not available');
			else{

				msg.push('Search Engines: OK');

				if($('#import-replace-engines').is(':checked')){
					Storage.setSearchEngines(to_import.searchEngines);
				}else{
					var prev_engines = Storage.getSearchEngines();
					Storage.setSearchEngines(prev_engines.concat(to_import.searchEngines));
				}
			}
		}

		if($('#import-style').is(':checked')){

			if(!to_import.hasOwnProperty('styleSheet'))
				msg.push('Styling: not available');
			else{
				msg.push('Styling: OK');
				Storage.setStyle(to_import.styleSheet);
			}

		}

		if($('#import-options').is(':checked')){

			if(!to_import.hasOwnProperty('options'))
				msg.push('Other settings: not available');
			else{
				msg.push('Other settings: OK');
				Storage.setOptions(to_import.options);
			}
		}

		alert('Settings has been imported.\n\n' + msg.join('\n'));

		chrome.runtime.sendMessage({action:"optionsChanged"});

		location.reload();

	}


	$('#export-settings-link').click(function(){

		$(this).toggleClass('selected');

		$('#import-settings').slideUp(200);

		$('#import-settings-link').removeClass('selected');


		$('#export-settings').slideToggle(200, function(){



			if($('#export-settings').is(':visible')){
				_load_export();
			}

		});

		var destination = $("body").offset().top + $("body").height();
		$("body").animate({ scrollTop: destination},200);

		return false;
	});


	$('#export-settings input').change(function(){
		_load_export();
	});

	$('#export-settings textarea').click(function(){
		this.select();
	});


	$('#import-settings-link').click(function(){

		$(this).toggleClass('selected');


		$('#export-settings').slideUp(200);


		$('#export-settings-link').removeClass('selected');


		$('#import-settings').slideToggle(200, function(){



		});
		var destination = $("body").offset().top + $("body").height();
		$("body").animate({ scrollTop: destination},200);

		return false;
	});

	$('#import-search-engines').change(function(){

		if($(this).is(':checked'))
			$('#import-replace-engines-opt').slideDown(100);
		else
			$('#import-replace-engines-opt').slideUp(100);

	});


	$('#import-submit').click(function(){

		var msg = ['This will overwrite you existing settings'];

		if($('#import-replace-engines').is(':checked'))
			msg.push('\nand your search engines');

		msg.push('.\n\nAre you sure you want to continue?');

		if(confirm(msg.join('')))
			_do_import();

	});



	$('#show-more-variables').click(function(){

		if($(this).data('old-text')){
			$(this).text($(this).data('old-text')).removeData('old-text');
		}else{
			$(this).data('old-text', $(this).text()).text('Hide');
		}




		$('#more-variables').slideToggle();

		return false;
	});


	$('#show-advanced-popup-opts').click(function(){

		$('#popup-advanced-options').slideToggle();
		return false;
	});

});
