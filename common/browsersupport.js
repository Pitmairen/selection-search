

const BrowserSupport = {

    createShadowDOM: function(element){
        if(element.attachShadow){
            return element.attachShadow({mode: 'closed'});
        } else if(element.createShadowRoot){
            return element.createShadowRoot();
        }else{
            return element;
        }
    },

    hasLastError: function(){
        return chrome.runtime.lastError != undefined && chrome.runtime.lastError != null;
    }

}

if (typeof window !== "undefined"){
    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = Array.prototype.forEach;
    }
}
