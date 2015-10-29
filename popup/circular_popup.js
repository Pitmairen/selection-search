
CircularPopup.protocol = Object.create(PopupModifier);

function CircularPopup(popup, style){

    PopupModifier.call(this);


    this.searchEnginesUpdated = function(engines){

        var st = [];
        st.push(".popup a{"+
            "position: absolute; width: 30px; height: 30px; "+
            "padding:0px; border-radius: 50%; line-height: 30px; text-align: center;}");
        st.push(".popup li.engine-separator {position: absolute; width: 1px; height: 1px; margin-left: 15px; margin-top: 15px;}");
        st.push(".popup {border-radius: 50%; border-width: 33px; background: none; box-shadow: none;}");
        st.push(".mainmenu > li:first-child{display: none;}");
        st.push(".popup .engine-name{display: none;}");
        st.push(".popup img{width: 16px; margin: 0 auto;}");
        st.push(".popup a:hover, .popup a.active {background: none;}");

        style.setCircularStyle(st.join("\n"));



        // Use a timeout to let the browser calculate the style before generating the menu.
        // This is needed to get the computed border width of the circle.
        setTimeout(function(){
            _generateCircularMenu(engines, popup.getNode(), 1);
        }, 250);


    }

    this.modifyShowPosition = function(x, y){
        var node = popup.getNode();
        var dim = Positioning.enableDimensions(node);
        x -= node.offsetWidth/2;
        y -= node.offsetHeight/2;
        dim.restore();
        return {x: x, y: y}
    }


    this.modifyForPreview = function(node){
        node.style.position = "relative";
    }


    this.modifySubmenuPosition = function(menuNode, anchor, x, y){

        var dim = Positioning.enableDimensions(menuNode);
        var pos = {x: anchor.offsetLeft - menuNode.offsetWidth/2 + anchor.offsetWidth/2,
            y: anchor.offsetTop - menuNode.offsetHeight/2 + anchor.offsetHeight/2}
        dim.restore();

        return pos;
    }


    function _generateCircularMenu(engines, menuNode, firstNode) {


        var anchor =  menuNode.querySelector(":scope > li a");

        var dim = Positioning.enableDimensions(menuNode);

        var aWidth = anchor.offsetWidth;
        if(aWidth == 0){
            aWidth = 30;
        }

        var nodes =  menuNode.querySelectorAll(":scope > li");
        var count = engines.length;
        var angle = (2*Math.PI)/count;
        var radius = (aWidth) / ((2*Math.PI)/count);

        if(radius < 20){
            radius = 20;
        }

        menuNode.style.width = (2*radius) + "px";
        menuNode.style.height = (2*radius) + "px";

        var borderWidth = parseInt(window.getComputedStyle(menuNode).getPropertyValue("border-width"), 10) + 4;

        for(var i=0; i < count; i++){

            if(engines[i].is_submenu){
                _generateCircularMenu(engines[i].engines, nodes[firstNode+i].querySelector(":scope > ul"), 0);
            }

            if(engines[i].is_separator){

                var x = Math.cos(angle*i + Math.PI/2)*(radius + borderWidth/2 + 2);
                var y = -Math.sin(angle*i + Math.PI/2)*(radius + borderWidth/2 + 2);
                nodes[firstNode+i].style.transform = "rotate("+(-angle*i)+"rad)";
                nodes[firstNode+i].style.top = (y+radius - aWidth/2 + 4) + "px";
                nodes[firstNode+i].style.left = (x+radius - aWidth/2 + 4) + "px";

            }else{

                var x = Math.cos(angle*i + Math.PI/2)*(radius + borderWidth/2 + 2);
                var y = -Math.sin(angle*i + Math.PI/2)*(radius+ borderWidth/2 + 2);
                var a = nodes[firstNode + i].querySelector("a:first-child");
                a.style.top = (y + radius - aWidth/2 + 4) + "px";
                a.style.left = (x + radius - aWidth/2 + 4) + "px";
            }

        }

        dim.restore();
    }


}

