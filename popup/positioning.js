
var Positioning = new function(){


    this.getOffsetRect = function(elem){
        
        var box = elem.getBoundingClientRect();

        var body = document.body;
        var docElem = document.documentElement;

        var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

        var clientTop = docElem.clientTop;
        var clientLeft = docElem.clientLeft;


        var top = box.top + scrollTop - clientTop;
        var left = box.left + scrollLeft - clientLeft;
        var bottom = top + (box.bottom - box.top);
        var right = left + (box.right - box.left);

        return {
            top: Math.round(top),
            left: Math.round(left),
            bottom: Math.round(bottom),
            right: Math.round(right),
        }
    }


    /*
     * Checks that the element is inside the browser window.
     * If not it will move the element so that it fitts inside the browser window,
     * or according to custom positioning settings.
     */
    this.checkPosition = function(node, style){


        var dimensions = this.enableDimensions(node);
        var pos = this.getOffsetRect(node);
        dimensions.restore();

        var bounds = {
            right :  window.pageXOffset + document.documentElement.clientWidth,
            bottom : window.pageYOffset + document.documentElement.clientHeight,
            left : window.pageXOffset,
            top : window.pageYOffset,
        }

        // Style config settings for how to reposition the menu and button. The
        // "null" case is for nodes that should always be automatically repositioned
        // such as the submenu or engine editor.
        if(style && node.classList.contains("mainmenu")){
            var diffConfig = {
                right : style.getConfigValue('menu_edge_right'),
                bottom : style.getConfigValue('menu_edge_bottom'),
                left : style.getConfigValue('menu_edge_left'),
                top : style.getConfigValue('menu_edge_top'),
            }
        }else if(style && node.classList.contains("button")){
            var diffConfig = {
                right : style.getConfigValue('button_edge_right'),
                bottom : style.getConfigValue('button_edge_bottom'),
                left : style.getConfigValue('button_edge_left'),
                top : style.getConfigValue('button_edge_top'),
            }
        }else if(style === null){
            var diffConfig = {
                right : "auto",
                bottom : "auto",
                left : "auto",
                top : "auto",
            }
        }

        // How much to repositon the menu
        var diffY = null;
        var diffX = null;


        if (pos.bottom > bounds.bottom) { // Goes outside on the bottom
            if (diffConfig.bottom === "auto")
                diffY = bounds.bottom - pos.bottom;
            else
                diffY = parseInt(diffConfig.bottom);
        } else if (pos.top < bounds.top) { // Goes outside on the top
            if (diffConfig.top === "auto")
                diffY = bounds.top - pos.top;
            else
                diffY = parseInt(diffConfig.top);
        }
        

        if(pos.right > bounds.right){ // Goes outside on the right
            if (diffConfig.right === "auto")
                diffX = bounds.right - pos.right;
            else
                diffX = parseInt(diffConfig.right);
        }else if(pos.left < bounds.left){ // Goes outside on the left.
            if (diffConfig.left === "auto")
                diffX = bounds.left - pos.left;
            else
                diffX = parseInt(diffConfig.left);
        }


        // Reposition the menu
        if(diffY !== null)
           node.style.top = parseInt(node.style.top) + diffY + "px";
        if(diffX !== null)
           node.style.left = parseInt(node.style.left) + diffX + "px";

    }


    this.calculateSubmenuPosition = function(anchor, popupNode, style){


        var pos = style.getConfigValue('submenu_position');
        var corner = style.getConfigValue('submenu_corner');
        pos = pos.match(/^(top|bottom)(right|left)$/);
        corner = corner.match(/^(top|bottom)(right|left)$/);


        var dimensions = this.enableDimensions(popupNode);

        var ret = {x: anchor.offsetLeft, y:anchor.offsetTop};

        if(pos[1] == 'bottom')
            ret.y += anchor.offsetHeight;
        if(pos[2] == 'right')
            ret.x += anchor.offsetWidth;

        if(corner[1] == 'bottom')
            ret.y -= popupNode.offsetHeight;
        if(corner[2] == 'right')
            ret.x -= popupNode.offsetWidth;

        dimensions.restore();

        return ret;
    }


    /**
     * When the a html element is hidden with display=none the
     * dimensions eg. el.offsetHeight ect. is not availiable
     * or incorrect. This function uses a trick to make the dimensions
     * availiable. The restore method on the returned object must
     * be called when the caller is done.
     */
    this.enableDimensions = function(el){

        // store old values so we can reset later
        var old_visibility = el.style.visibility;
        var old_display = el.style.display;
        el.style.visibility = "hidden";
        el.style.display = 'block';

        return new function(){

            this.restore = function(){
                el.style.visibility = old_visibility;
                el.style.display = old_display;
            }

        }
    }
}
