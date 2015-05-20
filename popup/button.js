


function Button(_popup){
    

    var _buttonNode = _createButtonNode();

    var _active = false;

    var _this = this;

    /*
     * Returns if the button is currently being displayed.
     */
    this.isActive = function(){
        return _active;
    }

    /*
     * Returns the button element
     */
    this.getNode = function(){
        return _buttonNode;
    }


    /*
     * Shows the menu at the specified position
     */
    this.show = function(x, y){

        _buttonNode.style.top = y + "px";
        _buttonNode.style.left = x + "px";
        Positioning.checkPosition(_buttonNode);
        _buttonNode.style.display = "block";
        _active = true;

    }

    this.hide = function(){
        _buttonNode.style.display = "none";
        _active = false;
    }

    
    /*
     * Shows the button
     * Used to create a preview of the button on
     * the options page.
     */
    this.showForPreview = function(){
        _buttonNode.style.position = "static";
        _buttonNode.style.display = "block";
    }



    function _createButtonNode(){

        var node = document.createElement("div");
        node.className = "button common";
        node.style.display = "none";
        node.style.backgroundImage = 'url("' + chrome.extension.getURL('img/icon16.png') + '")';

        _addButtonEvents(node);

        return node;
    }


    function _addButtonEvents(node){

	    node.addEventListener('mouseenter', function(e){
            var pos = Positioning.getOffsetRect(node);
            _this.hide();
            _popup.show(pos.left, pos.top);
        });

    }

}


