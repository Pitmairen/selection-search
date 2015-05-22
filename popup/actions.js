

function PopupAction()
{

    this.onEnter = function(evt, engine, anchorElement){

    }

    this.onClick = function(evt, engine, anchorElement){

    }


}



CopyAction.prototype = Object.create(PopupAction);

function DefaultAction(popup, utils, options)
{

    PopupAction.call(this);

    this.onEnter = function(evt, engine, anchorElement){

        var href = utils.createSearchUrl(engine, popup.getSelection());
        // var href = utils.replaceSelection(engine.url, popup.getSelection());
        // href = utils.replaceURLVariables(href);

        anchorElement.href = href;
    }




    this.onClick = function(evt, engine, anchorElement){

        if(engine.is_submenu && engine.openall){
            evt.preventDefault();
            evt.stopPropagation();
            _clickSubmenu(engine);
            return;
        }
        else if(engine.url.substr(0, 11) === "javascript:")
            return;


        if(options.newtab){

            if(options.background_tab || engine.background_tab){
                utils.openAllUrls(engine, [anchorElement.href], popup.getSelection());
                evt.preventDefault();
                evt.stopPropagation();
            }
            else
                anchorElement.target = "_blank";
        }

    }


    function _clickSubmenu(engine){
        utils.openAllInSubmenu(engine, popup.getSelection());
    }



}


CopyAction.prototype = Object.create(PopupAction);
/*
 * Copy the current selection to the clipboard.
 */
function CopyAction(popup)
{
    PopupAction.call(this);

    this.onEnter = function(evt, engine, anchorElement){
        anchorElement.href = "copy:to-clipboard";
    }

    this.onClick = function(evt, engine, anchorElement){

        chrome.runtime.sendMessage({
            action:'copyToClipboard', text: popup.getSelection(),
        });

        evt.preventDefault();
        evt.stopPropagation();

    }
}


DomainAction.prototype = Object.create(PopupAction);

/*
 * Simply puts the selection into the href of the link.
 */
function DomainAction(popup)
{

    PopupAction.call(this);

    this.onEnter = function(evt, engine, anchorElement){
        var href = popup.getSelection();
        if(!href.match(/^(https?|ftp):\/\//))
            href = 'http://' + href;

        anchorElement.href = href;
    }

}



MenuHider.prototype = Object.create(PopupAction);
/*
 * Hide the menu after a click if the right options are set
 */
function MenuHider(popup, options)
{
    PopupAction.call(this);

    this.onClick = function(evt, engine, anchorElement){

        if(options.hide_on_click && popup.isActive())
            popup.hide();
        else if(engine.hide_on_click && popup.isActive())
            popup.hide();

    }

}



function ActionCollection(){

    var _actions = {};
    var _defaultAction = new PopupAction(); // Do nothing

    var _this = this;

    this.setDefaultAction = function(action){
        _defaultAction = action;
    }

    this.addAction = function(cmd, action){
        _actions[cmd] = action;
    }

    this.getAction = function(cmd){
        if(_actions.hasOwnProperty(cmd))
            return _actions[cmd];
        return _defaultAction;
    }

    this.onClick = function(evt, engine, a){
        var act = _this.getAction(engine.url);
        return act.onClick(evt, engine, a);
    }

    this.onEnter = function(evt, engine, a){
        var act = _this.getAction(engine.url);
        return act.onEnter(evt, engine, a);

    }


}



PopupActionUtils.prototype = Object.create(BaseActionUtils);

function PopupActionUtils(){

    BaseActionUtils.call(this);

    var _urlVariables = [
        [/%PAGE_HOST/g, encodeURIComponent(location.host)],
        [/%PAGE_URL/g, encodeURIComponent(location.href)],
        [/%PAGE_ORIGIN/g, encodeURIComponent(location.origin)],
    ];

    var _this = this;

    if(location.search.substr(0, 12) == '?javascript:')
        _urlVariables.push([/%PAGE_QUERY_STRING/g, '']);
    else
        _urlVariables.push([/%PAGE_QUERY_STRING/g, encodeURIComponent(location.search.substr(1))]);


    this.replaceVariables = function(url){
        for(var i in _urlVariables){
            url = url.replace(_urlVariables[i][0], _urlVariables[i][1]);
        }

        if(url.match(/%PAGE_QS_VAR\(.+?\)/)){
            url = _this.replaceQueryStringVars(url, location.search.substr(1));
        }
        return url;
    }





}

