
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
     * If not it will move the element so that it fitts inside the browser window.
     */
    this.checkPosition = function(node){

        // This is needed to get the real coordinates,
        // because they are not correct when display=none.
        var display = node.style.display;
        var visibility = node.style.visibility;
        node.style.display = "block";
        node.style.visibility = "hidden";
        var pos = this.getOffsetRect(node);
        // Restore the values.
        node.style.display = display;
        node.style.visibility = visibility;


        var bounds = {
            right :  window.pageXOffset + document.documentElement.clientWidth,
            bottom : window.pageYOffset + document.documentElement.clientHeight,
            left : window.pageXOffset,
            top : window.pageYOffset,
        }

        // How much to repositon the menu
        var diffY = null;
        var diffX = null;


        if (pos.bottom > bounds.bottom) // Goes outside on the bottom
            diffY = bounds.bottom - pos.bottom;
        else if (pos.top < bounds.top) // Goes outside on the top
            diffY = bounds.top - pos.top;
        

        if(pos.right > bounds.right) // Goes outside on the right
            diffX = bounds.right - pos.right;
        else if(pos.left < bounds.left) // Goes outside on the left.
            diffX = bounds.left - pos.left;


        // Reposition the menu
        if(diffY !== null)
           node.style.top = parseInt(node.style.top) + diffY + "px";
        if(diffX !== null)
           node.style.left = parseInt(node.style.left) + diffX + "px";

    }


    this.calculateSubmenuPosition = function(anchor, popupNode, style){

        popupNode.style.visibility = "hidden";
        popupNode.style.display = 'block';
        var pos = style.getConfigValue('submenu_position');
        var corner = style.getConfigValue('submenu_corner');
        pos = pos.match(/^(top|bottom)(right|left)$/);
        corner = corner.match(/^(top|bottom)(right|left)$/);

        var ret = {x: anchor.offsetLeft, y:anchor.offsetTop};

        if(pos[1] == 'bottom')
            ret.y += anchor.offsetHeight;
        if(pos[2] == 'right')
            ret.x += anchor.offsetWidth;

        if(corner[1] == 'bottom')
            ret.y -= popupNode.offsetHeight;
        if(corner[2] == 'right')
            ret.x -= popupNode.offsetWidth;
        
        popupNode.style.visibility = "visible";
        popupNode.style.display = 'none';


        return ret;
    }
}
