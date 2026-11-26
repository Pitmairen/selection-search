

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

var TOOLBAR_POPUP_OPTIONS = {
	'disabled' : 'Disabled',
	'enabled' :  'Enabled'
}

var _G_folder_id_count = 0;
var _G_engine_id_count = 0;

function emptyEngine(){
	return {name:'', url:'', icon_url:''}
}

function emptySeparator(){
	return {is_separator:true}
}

function emptySubmenu(){
	return {name:'New Submenu', url:'', icon_url:'', is_submenu:true}
}

function addNewEngine(en, level, add_at_position){


    var template_data = {en:en, id:++_G_engine_id_count};

	if(en.is_separator){
		_addSeparator(template_data, level, add_at_position);
        return;
	}

    if(en.is_submenu)
        template_data.folder_id = ++_G_folder_id_count;


    var el = $(render.searchengine(template_data));

	Reorder.makeMovable(el);

	el.data('level', level);

    _addEngineOptions(en, el);

	if(add_at_position !== undefined){
		$('#engines tr').eq(add_at_position).after(el);
	} else {
		$('#engines').append(el);
	}

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

	if(add_at_position !== undefined){
		$('#engines tr').eq(add_at_position + 1).after(end);
	} else {
		$('#engines').append(end);
	}

}


function _addSeparator(template_data, level, add_at_position){

    var el = $(render.separator(template_data));

	el.data('level', level);

	_addEngineOptions(template_data.en, el);

	Reorder.initElements(el);
	Reorder.makeMovable(el);

	if(add_at_position !== undefined){
		$('#engines tr').eq(add_at_position).after(el);
	}
	else {
		$('#engines').append(el);
	}
}

function _addEngineOptions(en, el){


	var opts = el.find('.engine-options-popup');
	var add_popup = el.find('.add-inline-popup');

	opts.on('click', function(e){
		e.stopPropagation();
	})

    opts.find('.close-popup').click(function(){
		opts.fadeOut(100);
        return false;
    });


	el.find('.engine-opts-link').click(function(){

		$('.dropdown-popup').not(opts).hide();

		var x = $(this).offset().left - opts.outerWidth()-4;
		var y = $(this).offset().top;
		opts.css({top:y+'px', left:x+'px'});
		opts.fadeToggle(100);
		return false;
	});

	el.find('.add-inline').click(function(){

		$('.dropdown-popup').not(add_popup).hide();

		var x = $(this).offset().left - add_popup.outerWidth()-4;
		var y = $(this).offset().top - add_popup.outerHeight() / 2 + 12;
		add_popup.css({top:y+'px', left:x+'px'});
		add_popup.fadeToggle(100);
		return false;
	});

	add_popup.find('button').click(function(){

		let index = el.index()
		let level = el.data('level')

		if($(this).hasClass("add-before")){
			index--
		} else {
			if (el.hasClass('menu-folder')){
				// When adding after a folder we increment the level to add the item
				// into the folder.
				level++;
			}
		}


		if($(this).hasClass('add-inline-engine')){
			addNewEngine(emptyEngine(), level, index)
		}
		else if($(this).hasClass('add-inline-separator')){
			addNewEngine(emptySeparator(), level, index)
		}
		else if($(this).hasClass('add-inline-submenu')){
			addNewEngine(emptySubmenu(), level, index)
		}
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

    opts.find('.openall_aux').attr('checked', Boolean(en.openall_aux));

    opts.find('.background_global').click(function(){
        opts.find('.background_tab').attr('disabled', $(this).is(":checked"));
    });

	opts.find('.hide_in_popup').attr('checked', !Boolean(en.hide_in_popup));
    opts.find('.hide_in_ctx').attr('checked', !Boolean(en.hide_in_ctx));
    opts.find('.hide_in_toolbar').attr('checked', !Boolean(en.hide_in_toolbar));
    opts.find('.nosync').attr('checked', !Boolean(en.nosync));
	opts.find('.post').attr('checked', Boolean(en.post));
    opts.find('.hide_on_click').attr('checked', Boolean(en.hide_on_click));
    opts.find('.open_in_incognito').attr('checked', Boolean(en.open_in_incognito));
    opts.find('.open_in_window').attr('checked', Boolean(en.open_in_window));
    opts.find('.open_in_popup').attr('checked', Boolean(en.open_in_popup));

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

    opts.find(".negate_newtab_option").attr('checked', Boolean(en.negate_newtab_option));

    // folders
    opts.find('.hidemenu').attr('checked', Boolean(en.hidemenu));

	if(!en.is_separator){
		var hotkeys = HotKeys.createHotkeyInputForElement(opts.find('.hotkey-definition-input'), en.hotkey || []);
		opts.find('.clear-hotkey').on('click', function(){
			hotkeys.clearCombo();
			return false;
		});
	}
}



function loadPopupPreview(){


    var dom = document.documentElement;
    var style = new Style(dom);

    var preview_container = document.getElementById("preview");

    var preview_button = document.getElementById("preview-button");

	chrome.runtime.sendMessage({action:"getContentScriptData"}, function(response){

        style.setDefaultStyle(response.default_style);

        if(response.extra_style)
            style.setCustomStyle(response.extra_style);


        var popup = new Popup(response.options, style);

        if(response.options.circular_menu){
            popup.setModifier(new CircularPopup(popup, style, response.options));
        }


        popup.showForPreview();
        preview_container.appendChild(popup.getNode());
        popup.setSearchEngines(response.engines.slice(0, 5));


        var button = new Button(popup, style);
        button.showForPreview();
        preview_button.appendChild(button.getNode());


        chrome.runtime.sendMessage({action:"getPopupIcons"}, function(response){

            popup.setIcons(response.icons);

        });

	});
    return style;

}


function initOptionsPage(){

	$("#chrome-shortcut").on('click', function(){
		chrome.tabs.create({'url': "chrome://extensions/shortcuts" } )
		return false;
	})

	// var popup = new PopUp();


	// The style system has changed.
	// Check if the user has changed the style. If it hasn't we can clear the stored style.
	var stored_style = Storage.getStyle('');
	if (stored_style == $('#old-default-style').val())
		Storage.setStyle('');

	var CURRENT_STYLE = '';
	var hotkey_editor = null;


    var styling = loadPopupPreview();



	chrome.runtime.sendMessage({action:"getOptions"}, function(response){

		// popup.setOptions(response.options);

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
		$("input[name='show-tooltips']").attr('checked', response.options.show_tooltips);

		$("#select_activator option[value='"+response.options.activator+"']").attr('selected', true);
		$("#select_activator").change();


		$('input[name=remove_icons][value='+response.options.remove_icons+']').attr('checked', true).change();


		hotkey_editor = HotKeys.createHotkeyInput('#k_and_m_keys', response.options.k_and_m_combo.slice(0, -1));
		$("#k_and_m_button").val(response.options.k_and_m_combo[response.options.k_and_m_combo.length-1]);



		$("#contextmenu_option option[value='"+response.options.context_menu+"']").attr('selected', true);
		$("#contextmenu_option").change();

		$("#toolbar_popup_option option[value='"+response.options.toolbar_popup+"']").attr('selected', true);
		$("#toolbar_popup_option").change();
		$("#opt-toolbar-popup-icons-only").attr('checked', response.options.toolbar_popup_style === 'icons-only');
		$("#opt-toolbar-popup-hotkeys").attr('checked', response.options.toolbar_popup_hotkeys);
		$("#opt-toolbar-popup-suggestions").attr('checked', response.options.toolbar_popup_suggestions);

		$("#opt-separate-engines").attr('checked', response.options.separate_menus).change();

		$("#opt-disable-extractform").attr('checked', response.options.disable_formextractor);

		$("#opt-open-on-dblclick").attr('checked', response.options.open_on_dblclick).change();
		$("#opt-dblclick-in-inputs").attr('checked', response.options.dblclick_in_inputs);
		$("#opt-open-new-tab-last").attr('checked', response.options.open_new_tab_last);

		$("#auto_popup_relative_to_mouse").attr('checked', response.options.auto_popup_relative_to_mouse);
		$("#auto_popup_show_menu_directly").attr('checked', response.options.auto_popup_show_menu_directly).change();
		$("#auto_popup_in_inputs").attr('checked', response.options.auto_popup_in_inputs);

		$("#opt-sync-engines").attr('checked', response.sync_options.sync_engines);
		$("#opt-sync-settings").attr('checked', response.sync_options.sync_settings);
		$("#opt-sync-style").attr('checked', response.sync_options.sync_style);

        $("#circular_menu").attr('checked', response.options.circular_menu);


		$("#opt-sort-by-click").attr('checked', response.options.sort_by_click);

		$("#opt-selection-allow-newline").attr('checked', response.options.selection_allow_newline);
		$("#opt-selection-length-limit").val(response.options.selection_length_limit).trigger('input');
		$("#opt-auto-hide-delay").val(response.options.auto_hide_delay);
		$("#opt-auto-open-delay").val(response.options.auto_open_delay);
		$("#opt-hide-on-scroll").attr('checked', response.options.hide_on_scroll);

		$("#opt-use-whitelist").attr('checked', response.options.use_whitelist);
		$("#blacklist-definitions").val(response.blacklist.join('\n'));
		$("#opt-use-blacklist-for-hotkeys").attr('checked', response.options.use_blacklist_for_hotkeys);
		$("#opt-allow-engines-without-selection").attr('checked', response.options.allow_engines_without_selection);

		$("#toolbarStyle").val(response.toolbar_style);

        // set activator combo
        for(var i in response.options.activator_combo){
            var act = response.options.activator_combo[i];
            $("#combo_"+act).attr("checked", true);

        }


        // Add search engines
		for (var i in response.searchEngines){
			var en = response.searchEngines[i];

			addNewEngine(en, 0);
		}

		$(document).on('click', function(){
			$('.dropdown-popup').hide();
		});

		$('#select_theme').change();

	});


	$('#search-icon').append('<img src="'+chrome.runtime.getURL('../img/icon16.png')+'" width="16px" height="16px" />');

	$('#new-engine').click(function(){
		addNewEngine(emptyEngine(), 0);
		return false;
	});

	$('#new-folder').click(function(){
		addNewEngine(emptySubmenu(), 0);
		return false;
	});

	$('#new-separator').click(function(){
		addNewEngine(emptySeparator(), 0);
		return false;
	});


	$("#opt-newtab").click(function(){

		if(!$(this).is(':checked')){
			$('.engine-opt-background_tab').hide();
		}else{
			$('.engine-opt-background_tab').show();
		}

	});

	$("#opt-selection-length-limit").on('input', function(){
		if($(this).val() <= 0){
			$(this).val("");
		}
	})

    $("#circular_menu").change(function(){

        var ok = confirm("This will overwrite any custom styling. "+
                "If you want to keep your styling you have to cancel and take a backup"+
                " of the style before you proceed."+
                "The options page will be saved and reloaded if you click ok.");

        if(!ok){
            $(this).attr('checked', !$(this).is(":checked"));
            return;
        }

        if($(this).is(":checked")){

            var css = $('#circular-style').val();
            $("#style").val(css);
            styling.setCustomStyle(css);

        }else{
            $("#style").val('');
            styling.setCustomStyle('');
        }

        $("#save").click();
        location.reload();
    });



	function saveCurrentSettingsToStore(dataStore){
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

			// The checkboxes for the hide_* options shows the oposite state of the hide option, so
			// if the checkbox is checked it means that the engine should not be hidden.
			if(en.hide_in_popup)
				delete en.hide_in_popup;
			else
				en.hide_in_popup = true;

			if(en.hide_in_ctx)
				delete en.hide_in_ctx;
			else
				en.hide_in_ctx = true;

			if(en.hide_in_toolbar)
				delete en.hide_in_toolbar;
			else
				en.hide_in_toolbar = true;

			if(en.nosync)
				delete en.nosync;
			else
				en.nosync = true;

			if(!en.open_in_incognito)
				delete en.open_in_incognito;

			if(!en.open_in_window){
				delete en.open_in_window;
			}

			if(!en.open_in_popup){
				delete en.open_in_popup;
			}

			if(en.background_global !== undefined){
				if(en.background_global)
					delete en.background_tab;
				delete en.background_global;
			}

			if(!en.negate_newtab_option){
				delete en.negate_newtab_option;
			}

            delete en['hotkey-definition-input'];

            en.hotkey = $(this).find('.hotkey-definition-input').data('hotkey');
			if(en.hotkey != undefined && en.hotkey.length === 0){
				delete en.hotkey;
			}

			if($(this).hasClass('menu-folder')){

				if(!en.openall){
					delete en.openall;
					delete en.hidemenu;
					delete en.hide_on_click;
					delete en.openall_aux;
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

				delete en.hotkey;

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


		dataStore.setSearchEngines(new_engines);

		dataStore.setStyle(jQuery.trim($('#style').val()));
		dataStore.setToolbarStyle(jQuery.trim($('#toolbarStyle').val()));


        var act_combo = $('input[name=activator_combo]:checked').map(function() {
                return $(this).val();
        }).get();


		var selection_limit = $("#opt-selection-length-limit").val();
		if(selection_limit === ""){
			selection_limit = -1;
		}

		var auto_hide_delay = parseInt($("#opt-auto-hide-delay").val());
		if(isNaN(auto_hide_delay) || auto_hide_delay < 0){
			auto_hide_delay = 0;
		}

		var auto_open_delay = parseInt($("#opt-auto-open-delay").val());
		if(isNaN(auto_open_delay) || auto_open_delay < 0){
			auto_open_delay = 0;
		}

		dataStore.setOptions({
			button: parseInt($("input[name='button']:checked").val(), 10),
			newtab: $("input[name='newtab']").is(':checked'),
			background_tab: $("input[name='background_tab']").is(':checked'),
			activator: $('#select_activator option:selected').first().attr('value'),
			remove_icons:$('input[name=remove_icons]:checked').val(),
			show_in_inputs: $('input[name=show_in_inputs]').is(':checked'),
			k_and_m_combo:k_and_m_combo,
			context_menu: $('#contextmenu_option option:selected').first().attr('value'),
			toolbar_popup: $('#toolbar_popup_option option:selected').first().attr('value'),
			toolbar_popup_style: $('#opt-toolbar-popup-icons-only').is(':checked') ? 'icons-only' : 'default',
			toolbar_popup_hotkeys: $('#opt-toolbar-popup-hotkeys').is(':checked'),
			toolbar_popup_suggestions: $('#opt-toolbar-popup-suggestions').is(':checked'),
			separate_menus: $('#opt-separate-engines').is(':checked'),
			hide_on_click: $("input[name='hide-on-click']").is(':checked'),
			disable_formextractor: $('#opt-disable-extractform').is(':checked'),
			open_on_dblclick: $('#opt-open-on-dblclick').is(':checked'),
			dblclick_in_inputs: $('#opt-dblclick-in-inputs').is(':checked'),
			open_new_tab_last: $('#opt-open-new-tab-last').is(':checked'),
			disable_effects: $('#opt-disable-effects').is(':checked'),
			show_tooltips: $('#opt-show-tooltips').is(':checked'),
			auto_popup_relative_to_mouse: $('#auto_popup_relative_to_mouse').is(':checked'),
			auto_popup_show_menu_directly: $('#auto_popup_show_menu_directly').is(':checked'),
			auto_popup_in_inputs: $("#auto_popup_in_inputs").is(':checked'),
            activator_combo: act_combo,
			circular_menu: $('#circular_menu').is(':checked'),
			sort_by_click: $('#opt-sort-by-click').is(':checked'),
			selection_allow_newline: $('#opt-selection-allow-newline').is(':checked'),
			use_whitelist: $('#opt-use-whitelist').is(':checked'),
			selection_length_limit: selection_limit,
			auto_hide_delay: auto_hide_delay,
			auto_open_delay: auto_open_delay,
			hide_on_scroll: $('#opt-hide-on-scroll').is(':checked'),
			use_blacklist_for_hotkeys: $('#opt-use-blacklist-for-hotkeys').is(':checked'),
			allow_engines_without_selection: $('#opt-allow-engines-without-selection').is(':checked'),
		});


		dataStore.setSyncOptions({
			sync_engines: $('#opt-sync-engines').is(':checked'),
			sync_settings: $("#opt-sync-settings").is(':checked'),
			sync_style: $('#opt-sync-style').is(':checked'),
		});


        var blacklist = $('#blacklist-definitions').val().split('\n').map(function(value){
            return value.trim();
        }).filter(function(value){
            return value.length > 0;
        });

        dataStore.setBlacklistDefinitions(blacklist);

	}

	$('#save').click(function(){
		saveCurrentSettingsToStore(Storage);
		chrome.runtime.sendMessage({action:"storageUpdated"});
		$(document).trigger('settings-saved');
	});

	$('#cancel').click(function(){
		location.reload();
	})


	$('#restore').click(function(){

		if(confirm("This will delete all your search engines and reset all the changes you have made")){

			Storage.clear();
			location.reload();
		}
		return false;
	});

	$('#update-preview').click(function(e){

        styling.setCustomStyle($('#style').val());

		return false;
	});

	var theme_select = $('#select_theme');

    if(!Storage.getOptions().circular_menu){
        $('.theme_def').each(function(){
            theme_select.append('<option value="' + $(this).attr('id')+'">'+$(this).attr('name')+'</option>');
        });
    }

    theme_select.change(function(){

        var opt = $('#select_theme option:selected').first();

        var id = opt.attr('value');

        if(id == 'current_style'){
            $("#style").val(CURRENT_STYLE);
            styling.setCustomStyle(CURRENT_STYLE);
            return;
        }

        var css = $('textarea#' + id).val();

        $("#style").val(css);

        styling.setCustomStyle(css);

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


	// Hide the option to position the button under the mouse if the option
	// to directly show the menu is enabled; otherwise, show the former
	// option.
	$('#auto_popup_show_menu_directly').change(function(){

		if($(this).is(':checked'))
			$("#auto_popup_relative_to_mouse_content").hide(100);
		else
			$("#auto_popup_relative_to_mouse_content").show(100);

	});



	for (var act in CONTEXTMENU_OPTIONS){
		var name = CONTEXTMENU_OPTIONS[act];
		$('#contextmenu_option').append('<option value="' + act + '">'+name+'</option>');
	}

	for (var act in TOOLBAR_POPUP_OPTIONS){
		var name = TOOLBAR_POPUP_OPTIONS[act];
		$('#toolbar_popup_option').append('<option value="' + act + '">'+name+'</option>');
	}


	$('#contextmenu_option').change(function(){

		var opt = $('#contextmenu_option option:selected').first();

		var val = opt.attr('value');
		if(val == 'disabled')
			$('#contextmenu_active').hide(100);
		else
			$('#contextmenu_active').show(100);

	});

	$('#toolbar_popup_option').change(function(){

		var opt = $('#toolbar_popup_option option:selected').first();

		var val = opt.attr('value');
		if(val == 'disabled')
			$('#toolbar_popup_active').hide(100);
		else
			$('#toolbar_popup_active').show(100);

	});



	$('#show_customize').click(function(){
		var hidden = $("#customize").is(":hidden");

		$('#customize').toggle();

		if (hidden){
			$('html, body').animate({
				scrollTop: $("#head-styling").offset().top
			}, 500);
		}

		return false;
	});


	$('#show_html').click(function(){
		$('#html').toggle();
		return false;
	});


	$('#show-blacklist-info').click(function(){
		$('.blacklist-info').slideToggle(200);
		return false;
	});


	$(document).on('focus', '.hotkey-definition-input', function(){
		var _input = $(this);
		var top = _input.offset().top - $("#hotkey_info").outerHeight() - 5;
		$("#hotkey_info").css({'top' : top+ 'px', 'left' : _input.offset().left + 'px'});
		$("#hotkey_info").slideToggle(100);
	});

	$(document).on('blur', '.hotkey-definition-input', function(){
		$("#hotkey_info").hide(100);
	});



	$('#opt-separate-engines').change(function(){

		$('#wrap-edit-separate-engines').toggle($(this).is(':checked'));

	});

	$('#opt-open-on-dblclick').change(function(){
		$('#opt-dblclick-in-inputs').attr('disabled', !$(this).is(':checked'));
	})

	// Returns the settings selected in the export section, or null if nothing is selected.
	function _get_export_data(){

		var to_export = {}

		if($('#export-search-engines').is(':checked'))
			to_export.searchEngines = Storage.getSearchEngines();
		if($('#export-style').is(':checked')){
			to_export.styleSheet =  Storage.getStyle();
			to_export.toolbarStyleSheet =  Storage.getToolbarStyle();
		}
		if($('#export-options').is(':checked'))
			to_export.options =  Storage.getOptions();

		if(jQuery.isEmptyObject(to_export))
			return null;

		if(Storage.getVersion() !== undefined){
			to_export.VERSION = Storage.getVersion();
		}
		return to_export;
	}

	function _load_export(){

		var to_export = _get_export_data();

		if(to_export){

			to_export = JSON.stringify(to_export);

			try{
				to_export = btoa(to_export);
			}catch(e){
				to_export = '1e:' + btoa(encodeURI(to_export));
			}

		}else
			to_export = '';

		$('#export-settings textarea').val(to_export);

	}

	$('#export-download').click(function(){

		var to_export = _get_export_data();

		if(!to_export){
			alert('Select what to include in the export first.');
			return;
		}

		// Escape all non-ASCII characters (e.g. "å" -> "å") so the file reads
		// the same whatever encoding it is later re-saved with (UTF-8, ANSI, etc.).
		var json = JSON.stringify(to_export, null, 2).replace(/[\u007f-￿]/g, function(c){
			return '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0');
		});

		var blob = new Blob([json], {type: 'application/json'});
		var url = URL.createObjectURL(blob);
		var a = document.createElement('a');
		a.href = url;
		a.download = 'selection-search-settings.json';
		document.body.appendChild(a);
		a.click();
		a.remove();
		setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
	});

	var _import_decoders = {
		'1e' : function(v){return JSON.parse(decodeURI(atob(v)))},
		'1' : function(v){return JSON.parse(atob(v))}
	}

	// Decodes exported settings. Accepts both the encoded format from the
	// export textarea and plain JSON (from "Download as file").
	// Returns null if the data can't be decoded.
	function _decode_import(text){

		text = text.trim();

		if(text.length == 0)
			return null;

		var data;

		try{

			if(text[0] == '{'){
				data = JSON.parse(text);
			}
			else {

				var parts = text.split(':');

				var decoder = '1';

				if(parts.length == 2){
					text = parts[1];
					decoder = parts[0];
				}

				if(decoder in _import_decoders)
					data = _import_decoders[decoder](text);
				else
					data = null;
			}

		}catch(err){
			data = null;
		}

		if(!data || typeof data !== 'object' || jQuery.isEmptyObject(data))
			return null;

		return data;
	}

	function _import_selection_empty(){
		return !$('#import-search-engines').is(':checked') &&
			!$('#import-style').is(':checked') &&
			!$('#import-options').is(':checked');
	}

	// Replace the current engines with the new engines, but keep the current
	// engines that are not synchronized (nosync) at their current positions, and
	// skip the new engines that are not synchronized (the publisher's private engines).
	function _replace_keeping_local_only_engines(current, incoming){

		var result = incoming.filter(function(en){ return !en.nosync; });

		current.forEach(function(en, i){
			if(en.nosync)
				result.splice(Math.min(i, result.length), 0, en);
		});

		return result;
	}

	// Applies the imported data according to the selected import options.
	//
	// If from_link is true, search engines always replace the existing engines,
	// except the ones that are not synchronized.
	function _apply_import(to_import, from_link){

		var msg = [];

		if($('#import-search-engines').is(':checked')){

			if(!Array.isArray(to_import.searchEngines))
				msg.push('Search Engines: not available');
			else{

				msg.push('Search Engines: OK');

				if(from_link){
					Storage.setSearchEngines(_replace_keeping_local_only_engines(
						Storage.getSearchEngines(), to_import.searchEngines));
				}
				else if($('#import-replace-engines').is(':checked')){
					Storage.setSearchEngines(to_import.searchEngines);
				}else{
					var prev_engines = Storage.getSearchEngines();
					Storage.setSearchEngines(prev_engines.concat(to_import.searchEngines));
				}
			}
		}

		if($('#import-style').is(':checked')){

			if(!to_import.hasOwnProperty('styleSheet') && !to_import.hasOwnProperty("toolbarStyleSheet"))
				msg.push('Styling: not available');
			else{
				msg.push('Styling: OK');
				if(to_import.hasOwnProperty('styleSheet')){
					Storage.setStyle(to_import.styleSheet);
				}
				if(to_import.hasOwnProperty('toolbarStyleSheet')){
					Storage.setToolbarStyle(to_import.toolbarStyleSheet);
				}
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

		alert('Settings have been imported.\n\n' + msg.join('\n'));

		chrome.runtime.sendMessage({action:"storageUpdated"});

		location.reload();

	}

	function _do_import(){

		var text = $('#import-settings textarea').val();

		if(text.trim().length == 0){
			alert('No data to import');
			return;
		}

		var to_import = _decode_import(text);

		if(!to_import){
			alert('Failed to import data');
			return;
		}

		if(_import_selection_empty()){
			alert('No data imported');
			return;
		}

		_apply_import(to_import, false);
	}


	// Import from link

	var _IMPORT_LINK_KEY = 'importLink';

	function _set_import_link_status(text, is_error){
		$('#import-link-grant-row').hide();
		$('#import-link-status').text(text).toggleClass('error', Boolean(is_error));
	}

	function _show_last_import_link(){
		var saved = Storage.getValue(_IMPORT_LINK_KEY);
		if(!saved || !saved.url)
			return;
		$('#import-link-url').val(saved.url);

		// Restore the import selection used with the link. (Older saved
		// links don't have it, then the checkboxes are left as they are.)
		if(saved.hasOwnProperty('engines')){
			$('#import-search-engines').prop('checked', Boolean(saved.engines));
			$('#import-style').prop('checked', Boolean(saved.style));
			$('#import-options').prop('checked', Boolean(saved.options));
			if(saved.engines)
				$('#import-replace-engines-opt').show();
		}
		if(saved.lastImported)
			_set_import_link_status('Last imported: ' + new Date(saved.lastImported).toLocaleString());
	}

	// Converts a share link to a direct download link, and returns the
	// host permissions needed to download it.
	function _resolve_import_link(link){

		var url = new URL(link); // Throws if invalid

		if(url.protocol !== 'https:')
			throw new Error('The link must start with https://');

		var host = url.hostname;

		if(host === 'drive.google.com'){
			// https://drive.google.com/file/d/<id>/view?usp=sharing
			// https://drive.google.com/open?id=<id>
			// https://drive.google.com/uc?id=<id>&export=download
			var m = url.pathname.match(/\/file\/d\/([^/]+)/);
			var id = m ? m[1] : url.searchParams.get('id');
			if(!id)
				throw new Error('Could not find the file id in the Google Drive link');
			return {
				url: 'https://drive.usercontent.google.com/download?export=download&id=' + encodeURIComponent(id),
				origins: ['https://drive.usercontent.google.com/*']
			};
		}

		if(host === 'www.dropbox.com' || host === 'dropbox.com'){
			// Share links end with dl=0 (preview page), dl=1 downloads the file.
			// The download redirects to *.dropboxusercontent.com
			url.searchParams.set('dl', '1');
			return {
				url: url.href,
				origins: ['https://' + host + '/*', 'https://*.dropboxusercontent.com/*']
			};
		}

		return {url: url.href, origins: [url.origin + '/*']};
	}

	async function _import_from_link(){

		var link = $('#import-link-url').val().trim();

		if(link.length == 0){
			alert('Enter the link to the settings file first.');
			return;
		}

		if(_import_selection_empty()){
			alert('Select what to import first.');
			return;
		}

		var resolved;
		try{
			resolved = _resolve_import_link(link);
		}catch(e){
			_set_import_link_status('Invalid link: ' + e.message, true);
			return;
		}

		_set_import_link_status('Downloading...');

		// First try without any host permission. This works for sites that
		// allow cross origin requests (CORS), e.g. raw GitHub Gist links.
		// Only ask for access to the site if that fails.
		var has_access = await chrome.permissions.contains({origins: resolved.origins});

		var text;
		try{
			var response = await fetch(resolved.url, {cache: 'no-store', credentials: 'omit'});
			if(!response.ok)
				throw new Error('the server responded with ' + response.status + ' ' + response.statusText);
			text = await response.text();
		}catch(e){
			// A TypeError means a network error, which is what a blocked
			// cross origin request looks like.
			if(!has_access && e instanceof TypeError){
				_pending_link = link;
				_pending_link_origins = resolved.origins;
				var hosts = resolved.origins.map(function(o){
					return o.replace(/^https:\/\//, '').replace(/\/\*$/, '');
				});
				_set_import_link_status('To download the file, the extension needs access to ' + hosts.join(' and ') +
					'. Chrome will describe this as "read and change" your data on the site, but the extension' +
					' only uses it to download the settings file.');
				$('#import-link-grant-row').show();
				return;
			}
			_set_import_link_status('Failed to download the file: ' + e.message, true);
			return;
		}

		var to_import = _decode_import(text);

		if(!to_import){
			_set_import_link_status('The link did not return a valid settings file. ' +
				'If it is a Google Drive or Dropbox link, make sure the file is shared with "Anyone with the link".', true);
			return;
		}

		var msg = [];

		if($('#import-search-engines').is(':checked') && Array.isArray(to_import.searchEngines)){
			var count = to_import.searchEngines.filter(function(en){ return !en.nosync; }).length;
			msg.push('Your search engines will be replaced with the ' + count +
				' search engines from the link (search engines where "Synchronize" is unchecked are kept).');
		}
		if($('#import-style').is(':checked'))
			msg.push('Your styling will be overwritten.');
		if($('#import-options').is(':checked'))
			msg.push('Your other settings will be overwritten.');

		if(_has_unsaved_changes())
			msg.push('\n' + _UNSAVED_CHANGES_WARNING);

		msg.push('\nAre you sure you want to continue?');

		if(!confirm(msg.join('\n'))){
			_set_import_link_status('');
			return;
		}

		var previous = Storage.getValue(_IMPORT_LINK_KEY);
		if(previous && previous.url)
			_remove_link_access(previous.url, resolved.origins);

		Storage.setValue(_IMPORT_LINK_KEY, {
			url: link,
			lastImported: Date.now(),
			engines: $('#import-search-engines').is(':checked'),
			style: $('#import-style').is(':checked'),
			options: $('#import-options').is(':checked')
		});

		_apply_import(to_import, true);
	}

	// Tabs in the export and import sections.
	function _select_settings_tab(tab){
		var section = tab.closest('#export-settings, #import-settings');
		section.find('.settings-tab').removeClass('selected');
		tab.addClass('selected');
		section.find('.settings-panel').hide();
		$('#' + tab.data('panel')).show();

		if(section.is('#import-settings')){
			// The replace option is only used when importing from a file or exported data,
			// importing from a link always replaces the search engines.
			$('#import-replace-engines-opt li').toggle(tab.data('panel') !== 'import-link-panel');
		}
	}

	$('.settings-tab').click(function(){
		_select_settings_tab($(this));
		return false;
	});

	// Open the link tab directly if a link has been saved.
	if(Storage.getValue(_IMPORT_LINK_KEY))
		_select_settings_tab($('.settings-tab[data-panel="import-link-panel"]'));

	$('#export-copy').click(async function(){
		var text = $('#export-settings textarea').val();
		if(!text){
			alert('Select what to include in the export first.');
			return;
		}
		try{
			await navigator.clipboard.writeText(text);
			$('#export-copy-status').text('Copied');
		}catch(e){
			$('#export-copy-status').text('');
			alert('Failed to copy: ' + e.message);
			return;
		}
		setTimeout(function(){ $('#export-copy-status').text(''); }, 2000);
	});

	var _pending_link = null;
	var _pending_link_origins = null;

	$('#import-link-grant').click(async function(){

		if(!_pending_link_origins)
			return;

		// Must be the first async call in the click handler (requires a user gesture).
		var granted;
		try{
			granted = await chrome.permissions.request({origins: _pending_link_origins});
		}catch(e){
			_set_import_link_status('Could not request access to the site: ' + e.message, true);
			return;
		}

		if(!granted){
			_set_import_link_status('Access to the site was not allowed, so the file could not be downloaded.', true);
			return;
		}

		_import_from_link();
	});

	$('#import-link-submit').click(function(){
		_import_from_link();
	});

	// Removes the site access granted for a link (if any), except the
	// origins in keep_origins (used by the new link).
	function _remove_link_access(link, keep_origins){
		var origins;
		try{
			origins = _resolve_import_link(link).origins;
		}catch(e){
			return;
		}
		origins = origins.filter(function(o){ return (keep_origins || []).indexOf(o) == -1; });
		if(origins.length == 0)
			return;
		chrome.permissions.remove({origins: origins}).catch(function(){});
	}

	$('#import-link-url').on('input', function(){

		var value = $(this).val().trim();

		// The "Grant access" button is for the link that was entered when it was
		// shown, so hide it if the link is changed.
		if(_pending_link !== null && value !== _pending_link){
			_pending_link = null;
			_pending_link_origins = null;
			_set_import_link_status('');
		}

		// Forget the saved link (and remove the site access) when the field is emptied.
		if(value.length == 0){
			var saved = Storage.getValue(_IMPORT_LINK_KEY);
			if(saved !== undefined){
				Storage.removeValue(_IMPORT_LINK_KEY);
				_set_import_link_status('');
				if(saved.url)
					_remove_link_access(saved.url);
			}
		}
	});

	$('#import-link-url').keydown(function(e){
		if(e.key === 'Enter')
			_import_from_link();
	});

	_show_last_import_link();


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


	// True if the settings on the page have changes that are not saved.
	function _has_unsaved_changes(){
		try{
			var tmpStore = newTempStorageDuplicate();
			saveCurrentSettingsToStore(tmpStore);
			return tmpStore.hasChanges(Storage);
		}catch(e){
			return false;
		}
	}

	var _UNSAVED_CHANGES_WARNING = 'You have unsaved changes on this page, they will be lost.';

	function _confirm_import(){

		var msg = ['This will overwrite your existing settings'];

		if($('#import-replace-engines').is(':checked'))
			msg.push('\nand your search engines');

		msg.push('.');

		if(_has_unsaved_changes())
			msg.push('\n\n' + _UNSAVED_CHANGES_WARNING);

		msg.push('\n\nAre you sure you want to continue?');

		return confirm(msg.join(''));
	}

	$('#import-submit').click(function(){

		if(_confirm_import())
			_do_import();

	});

	$('#import-file-input').change(async function(){

		var input = this;
		var file = input.files[0];

		// Reset the input so that selecting the same file again triggers a new import.
		function reset(){ input.value = ''; }

		if(!file)
			return;

		if(_import_selection_empty()){
			alert('Select what to import first.');
			reset();
			return;
		}

		var text;
		try{
			// Always decoded as UTF-8 (a UTF-8 BOM is removed).
			text = await file.text();
		}catch(e){
			alert('Failed to read the file: ' + e.message);
			reset();
			return;
		}

		var to_import = _decode_import(text);

		if(!to_import){
			alert('The file is not a valid settings file.');
			reset();
			return;
		}

		if(!_confirm_import()){
			reset();
			return;
		}

		_apply_import(to_import, false);
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

	$('#show-advanced-toolbar-opts').click(function(){

		$('#toolbar-advanced-options').slideToggle();
		return false;
	});



	// Detect changes in settings and show floating save button if changes are detected
	setTimeout(function(){

		function checkForChanges(){
			var tmpStore = newTempStorageDuplicate();
			saveCurrentSettingsToStore(tmpStore);
			if (tmpStore.hasChanges(Storage)) {
				$('.save-restore-buttons').addClass('changed');
			} else {
				$('.save-restore-buttons').removeClass('changed');
			}
			_update_save_button_state();
		}

		var _changeDetectTimeout = null;

		function detectChanges(){
			if(_changeDetectTimeout != null){
				clearTimeout(_changeDetectTimeout);
			}
			_changeDetectTimeout = setTimeout(function(){
				checkForChanges();
				_changeDetectTimeout = null;
			}, 250);
		}

		$(document).on('settings-saved', detectChanges);
		$(document).on('change', 'input,select,textarea', detectChanges);
		$(document).on('input', 'input,textarea', detectChanges);
		$(document).on('mouseup', '#new-engine, #new-separator, #new-folder, .delete, .drag-target, .clear-hotkey, .add-inline-button', detectChanges);

	}, 500);


	function _update_save_button_state(){
		if((window.innerHeight + window.scrollY) < (document.body.offsetHeight - 100)){
			$('.save-restore-buttons').addClass('floating');
		}else{
			$('.save-restore-buttons').removeClass('floating');
		}
	}

	$(window).on('scroll', _update_save_button_state);
	_update_save_button_state();

}


$(document).ready(function(){
	storageLocalSyncInit(Storage).then(values => {
		initOptionsPage();
	});
});
