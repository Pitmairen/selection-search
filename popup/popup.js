


function Popup(options, style){
    

    var _popupNode = _createPopupNode();
    _popupNode.classList.add("mainmenu");

    var _input = _createInputField(_popupNode);
    var _currentSelection = "";
    var _active = false;
    var _listeners = [];

    var _this = this;
    
    this.addActionListener = function(listener){
        _listeners.push(listener);
    }

    /*
     * Returns if the menu is currently being displayed.
     */
    this.isActive = function(){
        return _active;
    }


    /*
     * Sets the current selection
     */
    this.setSelection = function(sel){
        _setSelection(sel);
        _input.value = sel;
    }

    /*
     * Returns the current selections.
     */
    this.getSelection = function(){
        return _currentSelection;
    }


    /*
     * Returns the root popup node element.
     */
    this.getNode = function(){
        return _popupNode;
    }


    /*
     * Shows the menu at the specified position
     */
    this.show = function(x, y){

        _showPopupNode(x, y, _popupNode);
        _active = true;

    }

    /*
     * Hides the menu node
     */
    this.hide = function(){
        _hidePopupNode(_popupNode);
        _active = false;
    }

    
    /*
     * Shows the menu.
     * Used to create a preview of the popup on
     * the options page.
     */
    this.showForPreview = function(){

        _popupNode.style.position = "static";
        _popupNode.style.display = "block";
        _popupNode.style.marginTop = "0";
        _popupNode.style.marginLeft = "0";
    }

    /*
     * Sets the search engines
     */
    this.setSearchEngines = function(engines){
        _addEngines(engines, _popupNode);

    }


    /*
     * Sets the icons for the current engines
     */
    this.setIcons = function(icons){
        var engineNodes = _popupNode.getElementsByTagName("a");
        var len = Math.min(engineNodes.length, icons.length);
        for(var i=0; i < len; i++){
            var img = _createIconNode(icons[i]);
            engineNodes[i].insertBefore(img, engineNodes[i].firstChild);
        }
    }

    /*
     * Sets the icons for the specified indexes
     */
    this.setIconForIndexes = function(icon, indexes){
        var imgNodes = _popupNode.getElementsByTagName("img");
        var len = imgNodes.length;
        for(var i=0; i < len; i++){
            if(indexes.indexOf(i) !== -1){
                imgNodes[i].src = icon;
            }
        }
    }



    function _setSelection(value){
        _currentSelection = value;
    }

    function _createIconNode(url){

        var img = document.createElement("img");
        img.className = "engine-img";
        img.src = url;
        return img;


    }


    function _addEngines(engines, _parent){
        for(var i=0; i < engines.length; i++){
            _addEngine(engines[i], _parent);
        }
    }


    function _addEngine(engine, _parent){
            
        if(options.separate_menus && engine.hide_in_popup)
            return;

        if(engine.is_submenu){
            _parent.appendChild(_createSubMenu(engine));
        }
        else if(engine.is_separator){
            _parent.appendChild(_createSeparator(engine));
        }
        else{
            _parent.appendChild(_createEngine(engine));
        }

    }


    function _createPopupNode(){

        var node = document.createElement("ul");
        node.className = "popup common";
        node.style.display = "none";

        node.addEventListener("mousedown", function(e){

            // node.style.display="block";
            // e.preventDefault();
            e.stopPropagation();

        });

        return node;

    }


    function _createInputField(parentItem){

        var item = document.createElement('li');
        var input = document.createElement('input');
        input.type = 'text';
        item.appendChild(input);
        
        _addInputEvents(input);
        parentItem.appendChild(item);
        // document.documentElement.appendChild(item);

        return input;
    }


    function _createSubMenu(engine){


        var li = document.createElement("li");
        var a = document.createElement("a");
        var name = document.createElement("span");

        a.className = "engine-url";
        name.className = "engine-name";

        name.innerText = engine.name;
        a.href = "#";

        li.appendChild(a);
        a.appendChild(name);

        var node = _createPopupNode();

        
        node.classList.add("submenu");

        li.appendChild(node);

        _addSubMenuEvents(engine, node, a);

        _addEngines(engine.engines, node);

        return li;

    }


    function _createSeparator(engine){

        var li = document.createElement("li");

        li.className="engine-separator";

        return li;

    }


    /*
     * Creates the html for a search engine without icon.
     *
     * <li><a class="engine-url" href="#"><span class="engine-name"></span></a></li>
     */
    function _createEngine(engine){

        var li = document.createElement("li");
        var a = document.createElement("a");
        var name = document.createElement("span");
        a.className = "engine-url";
        name.className = "engine-name";

        name.innerText = engine.name;

        li.appendChild(a);
        a.appendChild(name);

        _addEngineEvents(engine, a);

        return li;
    }


    function _addInputEvents(input){

        input.addEventListener('input', function(e){

            _setSelection(input.value);

        });

    }


    function _addEngineEvents(engine, a){
        // Update the href value.
        a.addEventListener("mouseenter", function(e){

            _onEnterAction(e, engine, a);
            // a.href = engine.url.replace("%s", _this.getSelection());

        });

        a.addEventListener("click", function(e){

            _onClickAction(e, engine, a);

        });
    }

    
    function _onClickAction(evt, engine, a){

        for(var i in _listeners){
            _listeners[i].onClick(evt, engine, a);
        }

    }

    function _onEnterAction(evt, engine, a){

        for(var i in _listeners){
            _listeners[i].onEnter(evt, engine, a);
        }

    }


    function _addSubMenuEvents(engine, node, a){


        a.addEventListener("click", function(e){

            _onClickAction(e, engine, a);

        });

        if(engine.hidemenu) // The submenu shold not be shown
            return;


        var hide_timer = null; // hide timer id
        var show_timer = null; // show timer id

        // show the menu when mouse enters the anchor element
        a.addEventListener("mouseenter", function(e){

            _onEnterAction(e, engine, a);

            // do nothing if we already is getting ready to show.
            if(show_timer)
                return;


            // Don't hide if menu is already showing.
            clearTimeout(hide_timer);
            hide_timer = null;

            show_timer = setTimeout(function(){
                _showPopupNodeRelativeToAnchor(a, node);
                show_timer = null;
            }, 200);

        });


        // Hide the menu
        a.addEventListener("mouseleave", function(){

            // Don't show the menu if the mouse leavs before it is shown.
            clearTimeout(show_timer);
            show_timer = null;

            // Do nothing if we already is going to hide.
            if(hide_timer)
                return;


            hide_timer = setTimeout(function(){
                _hidePopupNode(node);
                hide_timer = null;
            }, 200);

        });

        // Keep the menu visible when mouse is above the menu.
        node.addEventListener("mouseenter", function(){

            a.classList.add("active");

            // Prevent the menu from hiding
            clearTimeout(hide_timer);
            hide_timer = null;

            _showPopupNodeRelativeToAnchor(a, node);
        });

        // Hide the menu when the mouse leavs the menu.
        node.addEventListener("mouseleave", function(){
            
            a.classList.remove("active");

            // Do nothing if we already are going to hide.
            if(hide_timer)
                return;

            hide_timer = setTimeout(function(){
                _hidePopupNode(node);
                hide_timer = null;
            }, 200);
        });


    }

    /*
     * Hides the popup node
     */
    function _hidePopupNode(node){

        node.style.display = "none";

    }

    /*
     * Shows the popup node
     */
    function _showPopupNode(x, y, node){

        // Modify the position of the popup menu so that, when using the "No
        // selection" styling option, the name of the first engine appears
        // under the mouse. This makes the first engine easy to select while
        // not covering up any icons with the mouse.
        // node.style.left = x + "px";
        // node.style.top = y + "px";
        node.style.left = x - 45 + "px";
        node.style.top = y - 8 + "px";

        // Keep it inside the screen
        Positioning.checkPosition(node);

        node.style.display = "block";

    }

    /*
     * Shows the popup node
     */
    function _showPopupNodeRelativeToAnchor(a, node){

        var pos = Positioning.calculateSubmenuPosition(a, node, style);

        _showPopupNode(pos.x, pos.y, node);

    }

}


