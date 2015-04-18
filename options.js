
Storage.storage_upgrades();

var ACTIVATORS = {
	'disabled' : 'Disabled',
	'click' : 'Mouse Click',
	'auto' :  'Auto',
// 	'contextmenu' : 'Context Menu',
	'k_and_m' : 'Keyboard shortcut + Mouse click',
	'combo' :  'Multiple Activators',
}

var CONTEXTMENU_OPTIONS = {
	'disabled' : 'Disabled',
	'enabled' :  'Enabled'
}
var _G_folder_id_count = 0;
var _G_engine_id_count = 0;


function addNewEngine(en, level){


    var template_data = {en:en, id:++_G_engine_id_count};

	if(en.is_separator){
		_addSeparator(template_data, level);
        return;
	}
    
    if(en.is_submenu)
        template_data.folder_id = ++_G_folder_id_count;


    var el = $(render.searchengine(template_data));

	Reorder.makeMovable(el);

	el.data('level', level);

    _addEngineOptions(en, el);

	$('#engines').append(el);

	if(!en.is_submenu){
		Reorder.initElements(el);
		return;
	}

	var engines = en.engines || [];

	for(var i=0,e=engines.length; i<e; ++i){
		addNewEngine(engines[i], level+1);
	}

    var end = $(render.folder_end(template_data)).data('level', level+1);

	Reorder.initElements(el);
	Reorder.initElements(end);

	$('#engines').append(end);

}


function _addSeparator(template_data, level){

    var el = $(render.separator(template_data));

	_addEngineOptions(template_data.en, el);

	Reorder.initElements(el);
	Reorder.makeMovable(el);
	$('#engines').append(el);


}

function _addEngineOptions(en, el){


    var opts = el.find('.engine-options-popup');

    opts.find('.close-popup').click(function(){
		opts.fadeOut(100);
        return false;
    });


	el.find('.engine-opts-link').click(function(){

		$('.engine-options-popup').not(opts).hide();

		var x = $(this).offset().left - opts.outerWidth()-4;
		var y = $(this).offset().top;
		opts.css({top:y+'px', left:x+'px'});
		opts.fadeToggle(100);
		return false;
	});

    
	el.find('.delete').click(function(){

		if(el.hasClass('menu-folder')){
			var elms = el.nextUntil('#end-'+el.attr('id'));
			$('#end-'+el.attr('id')).remove();
			elms.each(function(){$(this).data('level', $(this).data('level')-1);});
			Reorder.initElements(elms);
		}
		el.remove();
		return false;
	});



    opts.find('.openall').change(function(){
        opts.find('.hide_menu_wrap').toggle($(this).is(':checked'));
    }).attr('checked', Boolean(en.openall)).change();


    opts.find('.background_global').click(function(){
        opts.find('.background_tab').attr('disabled', $(this).is(":checked"));
    });

	opts.find('.hide_in_popup').attr('checked', !Boolean(en.hide_in_popup));
    opts.find('.hide_in_ctx').attr('checked', !Boolean(en.hide_in_ctx));
    opts.find('.nosync').attr('checked', !Boolean(en.nosync));
	opts.find('.post').attr('checked', Boolean(en.post));
    opts.find('.hide_on_click').attr('checked', Boolean(en.hide_on_click));

	if(en.background_tab === undefined){
		opts.find('.background_global').attr('checked', true);
		opts.find('.background_tab').attr('disabled', true);
	}else{
		opts.find('.background_global').attr('checked', false);
		opts.find('.background_tab').attr('checked', en.background_tab);
	}


    if(!$("#opt-newtab").is(':checked')){
        opts.find('.engine-opt-background_tab').hide();
    }else{
        opts.find('.engine-opt-background_tab').show();
    }

    // folders
    opts.find('.hidemenu').attr('checked', Boolean(en.hidemenu));


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

		if(response.extra_style){
			CURRENT_STYLE=response.extra_style;
			$('#select_theme').prepend('<option selected="selected" value="current_style">&lt;Current Style&gt;</option>');
		}


		$("input[name='button']").filter("[value="+response.options.button+"]").attr('checked', true);

		$("input[name='newtab']").attr('checked', response.options.newtab);
		$("input[name='background_tab']").attr('checked', response.options.background_tab);

		$("input[name='show_in_inputs']").attr('checked', response.options.show_in_inputs);
		$("input[name='hide-on-click']").attr('checked', response.options.hide_on_click);
		$("input[name='disable-effects']").attr('checked', response.options.disable_effects);

		$("#select_activator option[value='"+response.options.activator+"']").attr('selected', true);
		$("#select_activator").change();


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


        // set activator combo
        for(var i in response.options.activator_combo){
            var act = response.options.activator_combo[i];
            $("#combo_"+act).attr("checked", true);

        }

        // Add search engines
		for (var i in response.searchEngines){
			var en = response.searchEngines[i];

			if(i < 3) // add 3 engines for preview
				popup.addSearchEngine(en);


			addNewEngine(en, 0);
		}

		Common.setStyleSheet(response.default_style);
		if(response.extra_style)
			Common.setStyleSheet(response.extra_style);


		$('#preview').append(popup.getForPreview());
		$('#preview-button').append(popup.getButtonForPreview());


		$('#select_theme').change();

	});


	$('#search-icon').append('<img src="'+chrome.extension.getURL('img/icon16.png')+'" width="16px" height="16px" />');

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


	$("#opt-newtab").click(function(){

		if(!$(this).is(':checked')){
			$('.engine-opt-background_tab').hide();
		}else{
			$('.engine-opt-background_tab').show();
		}

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

			if(en.icon_url === '')
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

			if(en.background_global !== undefined){
				if(en.background_global)
					delete en.background_tab;
				delete en.background_global;
			}

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

		// When we get here only the root item should be left
		var new_engines = folder_stack[0].engines;



		var k_and_m_combo = hotkey_editor.getCombo();
		k_and_m_combo.push(parseInt($("#k_and_m_button").val(), 10));


		Storage.setSearchEngines(new_engines);

		Storage.setStyle(jQuery.trim($('#style').val()));


        var act_combo = $('input[name=activator_combo]:checked').map(function() {
                return $(this).val();
        }).get();



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
            activator_combo: act_combo,
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

        // Change the link text to "Hide" when the variables is shows.
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
