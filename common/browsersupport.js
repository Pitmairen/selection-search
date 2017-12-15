

var BrowserSupport = {

    createShadowDOM: function(element){
        if(element.attachShadow){
            return element.attachShadow({mode: 'closed'});
        } else if(element.createShadowRoot){
            return element.createShadowRoot();
        }else{
            return element;
        }
    }

}